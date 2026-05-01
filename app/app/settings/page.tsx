import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, plan, reminder_returns_enabled, reminder_warranty_enabled")
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
        <h2 className="text-base font-semibold">Email reminders</h2>
        <p className="mt-2 text-sm text-muted">
          Reminder preferences and billing portal arrive on Day 2/3.
        </p>
      </section>
    </>
  );
}
