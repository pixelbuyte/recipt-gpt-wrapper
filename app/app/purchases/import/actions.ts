"use server";

import Papa from "papaparse";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseDollarsToCents } from "@/lib/format";

const FREE_TIER_LIMIT = 10;
const MAX_ROWS = 500;
const MAX_BYTES = 2 * 1024 * 1024; // 2MB CSV

const HEADER_SYNONYMS: Record<string, string> = {
  item: "item_name",
  item_name: "item_name",
  name: "item_name",
  product: "item_name",
  description: "item_name",

  merchant: "merchant",
  store: "merchant",
  vendor: "merchant",
  seller: "merchant",

  date: "order_date",
  order_date: "order_date",
  purchased: "order_date",
  purchase_date: "order_date",

  price: "price",
  amount: "price",
  total: "price",
  cost: "price",

  currency: "currency",

  category: "category",

  return: "return_deadline",
  return_deadline: "return_deadline",
  return_by: "return_deadline",

  warranty: "warranty_end",
  warranty_end: "warranty_end",
  warranty_until: "warranty_end",

  notes: "notes",
  note: "notes",
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type RawRow = Record<string, string>;

export type ImportResult =
  | { ok: true }
  | { ok: false; errors: string[]; helpText?: string };

function normalizeHeader(header: string): string {
  const trimmed = header.trim().toLowerCase().replace(/\s+/g, "_");
  return HEADER_SYNONYMS[trimmed] ?? trimmed;
}

function s(v: string | undefined): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function parseDate(input: string | null): string | null | "invalid" {
  if (!input) return null;
  if (ISO_DATE.test(input)) return input;
  // Accept anything Date.parse handles (e.g. "Mar 15, 2025", "3/15/2025"),
  // but anchor to local Y/M/D to match the rest of the app and avoid
  // a UTC drift on the threshold.
  const ts = Date.parse(input);
  if (Number.isNaN(ts)) return "invalid";
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function importCsv(formData: FormData): Promise<ImportResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const file = formData.get("csv");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: ["Pick a CSV file to import."] };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, errors: ["CSV must be 2MB or smaller."] };
  }

  const text = await file.text();
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
    transform: (v) => (typeof v === "string" ? v.trim() : v),
  });

  if (parsed.errors.length > 0) {
    const e = parsed.errors[0];
    return {
      ok: false,
      errors: [`CSV parse error on row ${e.row ?? "?"}: ${e.message}`],
    };
  }

  const rows = parsed.data.filter((r) => Object.values(r).some((v) => v));
  if (rows.length === 0) {
    return { ok: false, errors: ["The CSV is empty."] };
  }
  if (rows.length > MAX_ROWS) {
    return {
      ok: false,
      errors: [`Up to ${MAX_ROWS} rows per import. Split the file and try again.`],
    };
  }

  // Required columns must exist as headers.
  const headers = parsed.meta.fields ?? [];
  const required = ["item_name", "order_date", "price"];
  const missing = required.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    return {
      ok: false,
      errors: [`Missing required column(s): ${missing.join(", ")}.`],
      helpText: "Required: item_name, order_date, price. Optional: merchant, currency, category, return_deadline, warranty_end, notes.",
    };
  }

  // Paywall: free tier capped at 10 total purchases.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if ((profile?.plan ?? "free") === "free") {
    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true });
    const remaining = FREE_TIER_LIMIT - (count ?? 0);
    if (rows.length > remaining) {
      return {
        ok: false,
        errors: [
          `Importing ${rows.length} rows would exceed the free plan limit of ${FREE_TIER_LIMIT} purchases (you have ${count ?? 0} already). Upgrade to Pro to import unlimited.`,
        ],
      };
    }
  }

  // Resolve user's categories + system defaults by name (case-insensitive).
  const { data: cats } = await supabase
    .from("categories")
    .select("id, name")
    .or(`user_id.eq.${user.id},user_id.is.null`);
  const catByName = new Map<string, string>();
  for (const c of cats ?? []) catByName.set(c.name.toLowerCase(), c.id);

  // Validate every row before inserting any. Atomic-on-validation: the
  // user fixes their CSV and retries instead of getting a half-imported
  // mess.
  const errors: string[] = [];
  const inserts: Array<Record<string, string | number | null>> = [];

  rows.forEach((r, i) => {
    const lineNo = i + 2; // header is row 1
    const itemName = s(r.item_name);
    const orderRaw = s(r.order_date);
    const priceRaw = s(r.price);

    if (!itemName) errors.push(`Row ${lineNo}: item_name is required.`);
    if (!orderRaw) errors.push(`Row ${lineNo}: order_date is required.`);
    if (!priceRaw) errors.push(`Row ${lineNo}: price is required.`);
    if (!itemName || !orderRaw || !priceRaw) return;

    const orderDate = parseDate(orderRaw);
    if (orderDate === "invalid") {
      errors.push(`Row ${lineNo}: couldn't parse order_date "${orderRaw}".`);
      return;
    }
    const returnDeadline = parseDate(s(r.return_deadline));
    if (returnDeadline === "invalid") {
      errors.push(`Row ${lineNo}: couldn't parse return_deadline.`);
      return;
    }
    const warrantyEnd = parseDate(s(r.warranty_end));
    if (warrantyEnd === "invalid") {
      errors.push(`Row ${lineNo}: couldn't parse warranty_end.`);
      return;
    }

    const priceCents = parseDollarsToCents(priceRaw);
    if (priceCents <= 0) {
      errors.push(`Row ${lineNo}: price must be greater than 0.`);
      return;
    }

    const currency = (s(r.currency) ?? "USD").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      errors.push(`Row ${lineNo}: currency "${r.currency}" is not a 3-letter code.`);
      return;
    }

    const catName = s(r.category);
    const categoryId = catName ? catByName.get(catName.toLowerCase()) ?? null : null;

    inserts.push({
      user_id: user.id,
      item_name: itemName,
      merchant: s(r.merchant),
      order_date: orderDate,
      price_cents: priceCents,
      currency,
      category_id: categoryId,
      return_deadline: returnDeadline,
      warranty_end: warrantyEnd,
      notes: s(r.notes),
    });
  });

  if (errors.length > 0) {
    // Cap to 10 messages to avoid drowning the user.
    return {
      ok: false,
      errors: errors.slice(0, 10).concat(
        errors.length > 10 ? [`…and ${errors.length - 10} more.`] : [],
      ),
    };
  }

  const { error } = await supabase.from("purchases").insert(inserts);
  if (error) {
    return { ok: false, errors: [`Database error: ${error.message}`] };
  }

  revalidatePath("/app");
  revalidatePath("/app/purchases");
  redirect(`/app/purchases?imported=${inserts.length}`);
}
