import Link from "next/link";
import { PackageOpen } from "lucide-react";

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
      <Link href="/app/purchases/new" className="btn-primary mt-6">
        Add your first purchase
      </Link>
    </div>
  );
}
