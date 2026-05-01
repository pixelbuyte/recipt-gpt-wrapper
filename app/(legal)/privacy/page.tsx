export const metadata = { title: "Privacy — Purchase Ping" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Privacy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: today.</p>

      <h2 className="mt-8 text-lg font-semibold">What we collect</h2>
      <p className="mt-2 text-sm">
        Your email address (for sign-in and reminders), the purchases you
        enter, any receipt files you upload, and your Stripe customer ID and
        subscription state if you upgrade. We do not collect bank or card
        details — those go directly to Stripe.
      </p>

      <h2 className="mt-6 text-lg font-semibold">How we use it</h2>
      <p className="mt-2 text-sm">
        Solely to operate Purchase Ping: showing you your data, sending the
        reminder emails you opted into, and processing payment for the Pro
        plan.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Sub-processors</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
        <li>Supabase — auth, database, file storage</li>
        <li>Stripe — billing</li>
        <li>Resend — reminder emails</li>
        <li>Vercel — hosting</li>
      </ul>

      <h2 className="mt-6 text-lg font-semibold">Deletion</h2>
      <p className="mt-2 text-sm">
        Settings → Danger zone deletes your account, all purchases and
        receipts, and cancels any active Stripe subscription.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Contact</h2>
      <p className="mt-2 text-sm">
        Questions: hello@purchaseping.com.
      </p>
    </>
  );
}
