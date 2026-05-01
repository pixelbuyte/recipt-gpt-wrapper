import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PurchaseTable } from "@/components/PurchaseTable";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("purchases")
    .select(
      "id, item_name, merchant, order_date, price_cents, currency, return_deadline, warranty_end, receipt_url, category:categories(name, color)",
    )
    .order("order_date", { ascending: false })
    .limit(100);

  const rows = (data ?? []).map((r: { category: { name: string; color: string }[] | { name: string; color: string } | null } & Record<string, unknown>) => ({
    ...r,
    category: Array.isArray(r.category) ? r.category[0] ?? null : r.category,
  })) as Parameters<typeof PurchaseTable>[0]["rows"];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>
        <Link href="/app/purchases/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add Purchase
        </Link>
      </div>
      <PurchaseTable rows={rows} />
    </>
  );
}
