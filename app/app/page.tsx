import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/StatCard";
import { DeadlineChip } from "@/components/DeadlineChip";
import { EmptyState } from "@/components/EmptyState";
import { SpendBarChart } from "@/components/SpendBarChart";
import { CategoryDonut } from "@/components/CategoryDonut";
import { addDaysISO, daysUntil, fmtDate, todayISO } from "@/lib/dates";
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
  const returnsHorizon = addDaysISO(today, 14);
  const warrantyHorizon = addDaysISO(today, 30);
  const sixMonthsAgo = addDaysISO(today.slice(0, 7) + "-01", -150);

  const [
    { count: total },
    { data: returns },
    { data: warranties },
    { data: monthRows },
    { data: chartRows },
  ] = await Promise.all([
    supabase.from("purchases").select("id", { count: "exact", head: true }),
    supabase
      .from("purchases")
      .select("id, item_name, merchant, order_date, price_cents, currency, return_deadline, warranty_end")
      .gte("return_deadline", today)
      .lte("return_deadline", returnsHorizon)
      .order("return_deadline", { ascending: true })
      .limit(5),
    supabase
      .from("purchases")
      .select("id, item_name, merchant, order_date, price_cents, currency, return_deadline, warranty_end")
      .gte("warranty_end", today)
      .lte("warranty_end", warrantyHorizon)
      .order("warranty_end", { ascending: true })
      .limit(5),
    supabase
      .from("purchases")
      .select("price_cents")
      .gte("order_date", today.slice(0, 7) + "-01"),
    supabase
      .from("purchases")
      .select("price_cents, order_date, category:categories(name, color)")
      .gte("order_date", sixMonthsAgo),
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

  const spendByMonth = bucketByMonth(today, (chartRows ?? []) as ChartRow[]);
  const byCategory = bucketByCategory((chartRows ?? []) as ChartRow[]);

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

      <div className="mt-6">
        <SpendBarChart data={spendByMonth} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <CategoryDonut data={byCategory} />
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent purchases</h2>
            <Link href="/app/purchases" className="text-sm text-accent">View all →</Link>
          </div>
          <p className="mt-2 text-sm text-muted">
            Search and filter on the purchases page.
          </p>
        </div>
      </div>
    </>
  );
}

type ChartRow = {
  price_cents: number;
  order_date: string;
  category: { name: string; color: string }[] | { name: string; color: string } | null;
};

function bucketByMonth(today: string, rows: ChartRow[]) {
  const months: { month: string; key: string; cents: number }[] = [];
  const [yStr, mStr] = today.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
    months.push({ month: label, key, cents: 0 });
  }
  for (const r of rows) {
    const key = r.order_date.slice(0, 7);
    const slot = months.find((mm) => mm.key === key);
    if (slot) slot.cents += r.price_cents;
  }
  return months.map(({ month, cents }) => ({ month, cents }));
}

function bucketByCategory(rows: ChartRow[]) {
  const map = new Map<string, { name: string; color: string; cents: number }>();
  for (const r of rows) {
    const cat = Array.isArray(r.category) ? r.category[0] ?? null : r.category;
    const name = cat?.name ?? "Uncategorized";
    const color = cat?.color ?? "#6B7280";
    const cur = map.get(name) ?? { name, color, cents: 0 };
    cur.cents += r.price_cents;
    map.set(name, cur);
  }
  return [...map.values()].sort((a, b) => b.cents - a.cents);
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
