import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { openBillingPortal } from "@/app/app/billing/actions";
import { deleteAccount, updateReminderPrefs } from "@/app/app/settings/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "email, full_name, plan, reminder_returns_enabled, reminder_warranty_enabled, plan_renews_at",
    )
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold">Billing</h2>
            <p className="mt-1 text-sm text-muted">
              {profile?.plan === "pro"
                ? `Pro plan${
                    profile?.plan_renews_at
                      ? `, renews ${new Date(profile.plan_renews_at).toLocaleDateString()}`
                      : ""
                  }.`
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
        <p className="mt-1 text-sm text-muted">
          Reminders fire only on the Pro plan.
        </p>
        <form action={updateReminderPrefs} className="mt-4 space-y-3">
          <Toggle
            name="returns"
            label="Return windows (3 days before)"
            defaultChecked={profile?.reminder_returns_enabled ?? true}
          />
          <Toggle
            name="warranty"
            label="Warranty expirations (14 days before)"
            defaultChecked={profile?.reminder_warranty_enabled ?? true}
          />
          <div className="pt-2">
            <button type="submit" className="btn-primary">
              Save preferences
            </button>
          </div>
        </form>
      </section>

      <section className="card mt-6 border-red-100 p-6">
        <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
        <p className="mt-1 text-sm text-muted">
          Permanently delete your account, all purchases, receipts, and any
          active Stripe subscription.
        </p>
        <form action={deleteAccount} className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
          <input
            name="confirm"
            type="text"
            className="input md:w-72"
            placeholder="Type 'delete my account'"
            required
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Delete account
          </button>
        </form>
      </section>
    </>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
      />
      {label}
    </label>
  );
}
