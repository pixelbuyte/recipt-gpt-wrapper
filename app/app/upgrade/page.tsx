import Link from "next/link";
import { startCheckout } from "@/app/app/billing/actions";

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

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlanCard cadence="monthly" price="$9" cadenceLabel="per month" />
        <PlanCard
          cadence="yearly"
          price="$79"
          cadenceLabel="per year"
          highlight="Save 26%"
        />
      </div>

      <ul className="mt-8 space-y-2 text-sm text-muted">
        <li>• Unlimited purchases</li>
        <li>• Email reminders 3 days before return windows close</li>
        <li>• Warranty expiration alerts</li>
        <li>• CSV export</li>
      </ul>

      <Link href="/app" className="mt-6 inline-block text-sm text-muted hover:text-ink">
        ← Back to dashboard
      </Link>
    </div>
  );
}

function PlanCard({
  cadence,
  price,
  cadenceLabel,
  highlight,
}: {
  cadence: "monthly" | "yearly";
  price: string;
  cadenceLabel: string;
  highlight?: string;
}) {
  return (
    <form action={startCheckout} className="card flex flex-col p-6">
      <input type="hidden" name="cadence" value={cadence} />
      <div className="flex items-center justify-between text-sm text-muted">
        <span className="capitalize">{cadence}</span>
        {highlight ? (
          <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-medium text-accent">
            {highlight}
          </span>
        ) : null}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-tight">{price}</span>
        <span className="text-sm text-muted">{cadenceLabel}</span>
      </div>
      <button type="submit" className="btn-primary mt-6">
        Start checkout
      </button>
    </form>
  );
}
