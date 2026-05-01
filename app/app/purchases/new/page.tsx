import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PurchaseForm } from "@/components/PurchaseForm";
import { ocrEnabled } from "@/lib/anthropic";

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const supabase = createClient();
  const [{ data: categories }, { data: { user } }] = await Promise.all([
    supabase.from("categories").select("id, name").order("name"),
    supabase.auth.getUser(),
  ]);
  const { data: profile } = user
    ? await supabase.from("profiles").select("plan").eq("id", user.id).single()
    : { data: null };

  // OCR is gated by both Pro plan and a configured ANTHROPIC_API_KEY.
  // Rendering the button only when both are true keeps free users from
  // seeing a teaser they can't use, and avoids 500s on misconfigured
  // deployments.
  const showOcr = ocrEnabled() && profile?.plan === "pro";

  return (
    <>
      <Link href="/app/purchases" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to purchases
      </Link>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Add purchase</h1>
      <PurchaseForm categories={categories ?? []} ocrEnabled={showOcr} />
    </>
  );
}
