"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addDaysISO, todayISO } from "@/lib/dates";

const SAMPLES: Array<{
  item_name: string;
  merchant: string;
  category_name: string;
  price_cents: number;
  daysAgo: number;
  returnDays: number | null;
  warrantyDays: number | null;
}> = [
  { item_name: "AirPods Pro", merchant: "Apple", category_name: "Electronics", price_cents: 24900, daysAgo: 4, returnDays: 30, warrantyDays: 365 },
  { item_name: "Standing desk", merchant: "Fully", category_name: "Home", price_cents: 89900, daysAgo: 22, returnDays: 30, warrantyDays: 365 * 7 },
  { item_name: "Hoka Clifton 9", merchant: "Hoka", category_name: "Clothing", price_cents: 14500, daysAgo: 6, returnDays: 30, warrantyDays: null },
  { item_name: "Vitamin D3", merchant: "Thorne", category_name: "Health", price_cents: 2999, daysAgo: 11, returnDays: null, warrantyDays: null },
  { item_name: "Allbirds runners", merchant: "Allbirds", category_name: "Clothing", price_cents: 12000, daysAgo: 2, returnDays: 30, warrantyDays: null },
];

export async function seedSamples() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count } = await supabase
    .from("purchases")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) {
    redirect("/app");
  }

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name")
    .or(`user_id.eq.${user.id},user_id.is.null`);
  const byName = new Map<string, string>();
  for (const c of cats ?? []) byName.set(c.name, c.id);

  const today = todayISO();
  const rows = SAMPLES.map((s) => ({
    user_id: user.id,
    item_name: s.item_name,
    merchant: s.merchant,
    order_date: addDaysISO(today, -s.daysAgo),
    price_cents: s.price_cents,
    currency: "USD",
    category_id: byName.get(s.category_name) ?? null,
    return_deadline:
      s.returnDays !== null ? addDaysISO(today, s.returnDays - s.daysAgo) : null,
    warranty_end:
      s.warrantyDays !== null ? addDaysISO(today, s.warrantyDays - s.daysAgo) : null,
    notes: "Sample purchase",
  }));

  const { error } = await supabase.from("purchases").insert(rows);
  if (error) throw new Error(error.message);

  revalidatePath("/app");
  revalidatePath("/app/purchases");
  redirect("/app");
}
