"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCents } from "@/lib/format";

type Point = { month: string; cents: number };

export function SpendBarChart({ data }: { data: Point[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Spend, last 6 months</h2>
      </div>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#6B7280"
            />
            <YAxis
              tickFormatter={(v: number) => `$${Math.round(v / 100)}`}
              tickLine={false}
              axisLine={false}
              fontSize={12}
              stroke="#6B7280"
              width={40}
            />
            <Tooltip
              cursor={{ fill: "#EEF2FF" }}
              formatter={(v: number) => formatCents(v)}
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontSize: 12,
              }}
              labelStyle={{ color: "#0B0B0F" }}
            />
            <Bar dataKey="cents" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
