"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseDollarsToCents } from "@/lib/format";

const FREE_TIER_LIMIT = 10;

function s(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length === 0 ? null : t;
}

export async function createPurchase(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Paywall: free tier capped at 10 purchases.
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  if ((profile?.plan ?? "free") === "free") {
    const { count } = await supabase
      .from("purchases")
      .select("id", { count: "exact", head: true });
    if ((count ?? 0) >= FREE_TIER_LIMIT) {
      redirect("/app/upgrade?reason=limit");
    }
  }

  const itemName = s(formData.get("item_name"));
  const orderDate = s(formData.get("order_date"));
  const priceStr = s(formData.get("price"));
  if (!itemName || !orderDate || !priceStr) {
    throw new Error("Item name, order date, and price are required.");
  }

  const priceCents = parseDollarsToCents(priceStr);
  if (priceCents <= 0) throw new Error("Price must be greater than 0.");

  const categoryId = s(formData.get("category_id"));
  const insert = {
    user_id: user.id,
    item_name: itemName,
    merchant: s(formData.get("merchant")),
    order_date: orderDate,
    price_cents: priceCents,
    currency: s(formData.get("currency")) ?? "USD",
    category_id: categoryId,
    return_deadline: s(formData.get("return_deadline")),
    warranty_end: s(formData.get("warranty_end")),
    notes: s(formData.get("notes")),
    receipt_path: null as string | null,
    receipt_url: null as string | null,
  };

  const receipt = formData.get("receipt") as File | null;
  if (receipt && receipt.size > 0) {
    if (receipt.size > 10 * 1024 * 1024) {
      throw new Error("Receipt must be 10MB or smaller.");
    }
    const ext = receipt.name.split(".").pop() ?? "bin";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("receipts")
      .upload(path, receipt, { contentType: receipt.type, upsert: false });
    if (upErr) throw new Error(`Upload failed: ${upErr.message}`);
    insert.receipt_path = path;
    const { data: signed } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    insert.receipt_url = signed?.signedUrl ?? null;
  }

  const { error } = await supabase.from("purchases").insert(insert);
  if (error) throw new Error(error.message);

  revalidatePath("/app");
  revalidatePath("/app/purchases");
  redirect("/app/purchases");
}
