import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/StatCard";
import { DeadlineChip } from "@/components/DeadlineChip";
import { EmptyState } from "@/components/EmptyState";
import { daysUntil, fmtDate, todayISO } from "@/lib/dates";
import { formatCents } from "@/lib/format";

export const dynamic = "force-dynamic";

type Purchase = {
  id: string;
  item_name: string;
  merchant: string | null;
  order_date: string;
  price_cents: number;
  currency: string;
  return_deadline: string | null;
  warranty_end: string | null;
};

export default async function DashboardPage() {
  const supabase = createClient();
  const today = todayISO();

  const [{ count: total }, { data: returns }, { data: warranties }, { data: monthRows }] =
    await Promise.all([
      supabase.from("purchases").select("id", { count: "exact", head: true }),
      supabase
        .from("purchases")
        .select("id, item_name, merchant, order_date, price_cents, currency, return_deadline, warranty_end")
        .gte("return_deadline", today)
        .order("return_deadline", { ascending: true })
        .limit(5),
      supabase
        .from("purchases")
        .select("id, item_name, merchant, order_date, price_cents, currency, return_deadline, warranty_end")
        .gte("warranty_end", today)
        .order("warranty_end", { ascending: true })
        .limit(5),
      supabase
        .from("purchases")
        .select("price_cents, order_date")
        .gte("order_date", today.slice(0, 7) + "-01"),
    ]);

  const monthSpend = (monthRows ?? []).reduce(
    (sum, r: { price_cents: number }) => sum + r.price_cents,
    0,
  );

  if ((total ?? 0) === 0) {
    return (
      <>
        <Header />
        <EmptyState />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Returns closing soon"
          value={(returns ?? []).length}
          sub="next 14 days"
        >
          {(returns ?? []).slice(0, 3).map((p: Purchase) => (
            <Row key={p.id} title={p.item_name} sub={p.merchant} days={daysUntil(p.return_deadline)} />
          ))}
        </StatCard>
        <StatCard
          label="Warranties ending"
          value={(warranties ?? []).length}
          sub="next 30 days"
        >
          {(warranties ?? []).slice(0, 3).map((p: Purchase) => (
            <Row key={p.id} title={p.item_name} sub={p.merchant} days={daysUntil(p.warranty_end)} />
          ))}
        </StatCard>
        <StatCard
          label="This month"
          value={formatCents(monthSpend)}
          sub={`${(monthRows ?? []).length} purchases`}
        />
      </div>

      <div className="mt-6 card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Recent purchases</h2>
          <Link href="/app/purchases" className="text-sm text-accent">View all →</Link>
        </div>
        <p className="mt-2 text-sm text-muted">Charts and full table arrive on Day 2.</p>
      </div>
    </>
  );
}

function Header() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted">{fmtDate(todayISO())}</p>
    </div>
  );
}

function Row({ title, sub, days }: { title: string; sub: string | null; days: number | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="min-w-0">
        <div className="truncate">{title}</div>
        {sub ? <div className="truncate text-xs text-muted">{sub}</div> : null}
      </div>
      <DeadlineChip days={days} />
    </div>
  );
}
