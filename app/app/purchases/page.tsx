import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PurchaseTable } from "@/components/PurchaseTable";
import { FiltersBar } from "@/components/FiltersBar";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  cat?: string;
  from?: string;
  to?: string;
};

export default async function PurchasesPage({ searchParams }: { searchParams: Search }) {
  const supabase = createClient();

  const { data: cats } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  let query = supabase
    .from("purchases")
    .select(
      "id, item_name, merchant, order_date, price_cents, currency, return_deadline, warranty_end, receipt_path, category:categories(name, color)",
    )
    .order("order_date", { ascending: false })
    .limit(100);

  const q = searchParams.q?.trim();
  if (q) {
    // Wrap in PostgREST's quoted-string syntax to neutralise reserved
    // characters in user input (`. , ( ) :` etc.). Inside the quotes only
    // the closing quote and backslash need stripping. Use `*` as the ilike
    // wildcard — that's PostgREST's syntax in raw `.or()` filters.
    const safe = q.replace(/["\\]/g, " ");
    const pattern = `*${safe}*`;
    query = query.or(
      `item_name.ilike."${pattern}",merchant.ilike."${pattern}",notes.ilike."${pattern}"`,
    );
  }
  if (searchParams.cat) {
    query = query.eq("category_id", searchParams.cat);
  }
  if (searchParams.from) {
    query = query.gte("order_date", searchParams.from);
  }
  if (searchParams.to) {
    query = query.lte("order_date", searchParams.to);
  }

  const { data } = await query;

  const paths = (data ?? [])
    .map((r: { receipt_path: string | null }) => r.receipt_path)
    .filter((p): p is string => Boolean(p));

  const signedByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from("receipts")
      .createSignedUrls(paths, 60 * 60);
    for (const s of signed ?? []) {
      if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
    }
  }

  type RawRow = Omit<Parameters<typeof PurchaseTable>[0]["rows"][number], "category" | "receipt_url"> & {
    receipt_path: string | null;
    category: { name: string; color: string }[] | { name: string; color: string } | null;
  };

  const rows: Parameters<typeof PurchaseTable>[0]["rows"] = ((data ?? []) as RawRow[]).map((r) => ({
    ...r,
    category: Array.isArray(r.category) ? r.category[0] ?? null : r.category,
    receipt_url: r.receipt_path ? signedByPath.get(r.receipt_path) ?? null : null,
  }));

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>
        <Link href="/app/purchases/new" className="btn-primary">
          <Plus className="h-4 w-4" /> Add Purchase
        </Link>
      </div>
      <FiltersBar categories={cats ?? []} />
      <PurchaseTable rows={rows} />
    </>
  );
}
