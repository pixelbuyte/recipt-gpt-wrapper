"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCents } from "@/lib/format";

type Slice = { name: string; cents: number; color: string };

export function CategoryDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.cents, 0);
  return (
    <div className="card p-6">
      <h2 className="text-base font-semibold">By category</h2>
      <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[200px_1fr]">
        <div className="h-48 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="cents"
                innerRadius={48}
                outerRadius={80}
                stroke="#fff"
                strokeWidth={2}
                paddingAngle={1}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, _n, p) => [formatCents(v), p.payload.name]}
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #E5E7EB",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-1.5 text-sm">
          {data.map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
              </span>
              <span className="tabular-nums text-muted">
                {total === 0 ? "—" : `${Math.round((d.cents / total) * 100)}%`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
