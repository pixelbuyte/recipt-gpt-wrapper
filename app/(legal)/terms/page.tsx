export const metadata = { title: "Terms — Purchase Ping" };

export default function TermsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight">Terms</h1>
      <p className="mt-2 text-sm text-muted">Last updated: today.</p>

      <h2 className="mt-8 text-lg font-semibold">The service</h2>
      <p className="mt-2 text-sm">
        Purchase Ping helps you track receipts, return windows, warranties,
        and spending. It is provided as-is, with no warranty. Reminders are a
        best-effort feature — don&apos;t rely on them for legally significant
        deadlines.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Your account</h2>
      <p className="mt-2 text-sm">
        You&apos;re responsible for keeping your email account secure and for
        the data you enter. Don&apos;t use the service to break the law or
        infringe anyone&apos;s rights.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Billing</h2>
      <p className="mt-2 text-sm">
        Pro is $9 per month or $79 per year, billed via Stripe. You can cancel
        any time from Settings → Manage billing; access continues to the end
        of the current period. Refunds are at our discretion.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Changes</h2>
      <p className="mt-2 text-sm">
        We may update these terms; material changes will be communicated by
        email. Continued use after a change constitutes acceptance.
      </p>

      <h2 className="mt-6 text-lg font-semibold">Contact</h2>
      <p className="mt-2 text-sm">hello@purchaseping.com.</p>
    </>
  );
}
