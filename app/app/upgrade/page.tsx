import Link from "next/link";

export default function UpgradePage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  const reason = searchParams.reason;
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Upgrade to Pro</h1>
      {reason === "limit" ? (
        <p className="mt-2 text-sm text-muted">
          You&apos;ve hit the 10-purchase limit on the free plan. Upgrade to keep
          tracking everything you buy.
        </p>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Unlock email reminders, unlimited purchases, and CSV export.
        </p>
      )}

      <div className="mt-8 card p-6">
        <div className="text-sm text-muted">Pro</div>
        <div className="mt-1 text-3xl font-semibold">
          $9<span className="text-base text-muted">/month</span>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          <li>• Unlimited purchases</li>
          <li>• Email reminders 3 days before return windows close</li>
          <li>• Warranty expiration alerts</li>
          <li>• CSV export</li>
        </ul>
        <button className="btn-primary mt-6 w-full" disabled title="Stripe checkout wired up on Day 2">
          Stripe checkout — Day 2
        </button>
      </div>

      <Link href="/app" className="mt-6 inline-block text-sm text-muted hover:text-ink">
        ← Back to dashboard
      </Link>
    </div>
  );
}
