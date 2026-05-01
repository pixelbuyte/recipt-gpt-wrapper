import Link from "next/link";
import { DeadlineChip } from "@/components/DeadlineChip";
import { daysUntil, fmtDate } from "@/lib/dates";
import { formatCents } from "@/lib/format";

type Row = {
  id: string;
  item_name: string;
  merchant: string | null;
  order_date: string;
  price_cents: number;
  currency: string;
  return_deadline: string | null;
  warranty_end: string | null;
  receipt_url: string | null;
  category: { name: string; color: string } | null;
};

export function PurchaseTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="card p-10 text-center text-sm text-muted">
        No purchases match.{" "}
        <Link href="/app/purchases/new" className="text-accent">Add one</Link>.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Merchant</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Return</th>
              <th className="px-4 py-3 text-left">Warranty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-border hover:bg-accent-50/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{p.item_name}</div>
                  {p.receipt_url ? (
                    <a
                      href={p.receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent"
                    >
                      receipt
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-muted">{p.merchant ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{fmtDate(p.order_date)}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatCents(p.price_cents, p.currency)}
                </td>
                <td className="px-4 py-3">
                  {p.category ? (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs"
                      style={{ color: p.category.color }}
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: p.category.color }}
                      />
                      <span className="text-ink">{p.category.name}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <DeadlineChip days={daysUntil(p.return_deadline)} />
                </td>
                <td className="px-4 py-3">
                  <DeadlineChip days={daysUntil(p.warranty_end)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
