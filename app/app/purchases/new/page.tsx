import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PurchaseForm } from "@/components/PurchaseForm";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const supabase = createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (
    <>
      <Link href="/app/purchases" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to purchases
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Add purchase</h1>
      <PurchaseForm categories={categories ?? []} />
    </>
  );
}
