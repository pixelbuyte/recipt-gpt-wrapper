import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { seedSamples } from "@/app/app/actions";

export function EmptyState() {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-full bg-accent-50 p-4 text-accent">
        <PackageOpen className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">No purchases yet</h2>
      <p className="mt-1 max-w-md text-sm text-muted">
        Drop in a purchase and we&apos;ll track its return window, warranty, and
        roll it into your monthly spending.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link href="/app/purchases/new" className="btn-primary">
          Add your first purchase
        </Link>
        <form action={seedSamples}>
          <button type="submit" className="btn-secondary">
            Load 5 sample items
          </button>
        </form>
      </div>
    </div>
  );
}
