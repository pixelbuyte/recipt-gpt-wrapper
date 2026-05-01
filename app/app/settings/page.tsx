import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { openBillingPortal } from "@/app/app/billing/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, plan, reminder_returns_enabled, reminder_warranty_enabled, plan_renews_at")
    .eq("id", user!.id)
    .single();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Settings</h1>

      <section className="card p-6">
        <h2 className="text-base font-semibold">Account</h2>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted">Email</dt>
            <dd>{profile?.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Plan</dt>
            <dd className="capitalize">{profile?.plan}</dd>
          </div>
        </dl>
      </section>

      <section className="card mt-6 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold">Billing</h2>
            <p className="mt-1 text-sm text-muted">
              {profile?.plan === "pro"
                ? `Pro plan${profile?.plan_renews_at ? `, renews ${new Date(profile.plan_renews_at).toLocaleDateString()}` : ""}.`
                : "Free plan. Upgrade to enable email reminders and unlimited purchases."}
            </p>
          </div>
          {profile?.plan === "pro" ? (
            <form action={openBillingPortal}>
              <button className="btn-secondary">Manage billing</button>
            </form>
          ) : (
            <Link href="/app/upgrade" className="btn-primary">
              Upgrade to Pro
            </Link>
          )}
        </div>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="text-base font-semibold">Email reminders</h2>
        <p className="mt-2 text-sm text-muted">
          Toggle controls arrive on Day 3. For now, reminders fire when your
          plan is Pro and the deadline is 3 days (returns) or 14 days (warranty)
          away.
        </p>
      </section>
    </>
  );
}
