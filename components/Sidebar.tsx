"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/purchases", label: "Purchases", icon: ListChecks },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ email, plan }: { email: string; plan: "free" | "pro" }) {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-white p-4">
      <Link href="/app" className="mb-8 flex items-center gap-2 px-2">
        <div className="h-7 w-7 rounded-md bg-accent" />
        <span className="text-base font-semibold tracking-tight">Purchase Ping</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                active ? "bg-accent-50 text-accent" : "text-ink hover:bg-gray-50",
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/app/purchases/new"
        className="btn-primary mt-6 w-full"
      >
        <Plus className="h-4 w-4" /> Add Purchase
      </Link>

      <div className="mt-auto rounded-card border border-border p-3">
        <div className="truncate text-xs text-muted">{email}</div>
        <div className="mt-1 flex items-center justify-between">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              plan === "pro"
                ? "bg-accent-50 text-accent"
                : "bg-gray-100 text-muted",
            )}
          >
            {plan === "pro" ? "Pro" : "Free"}
          </span>
          <form action="/auth/signout" method="post">
            <button className="text-xs text-muted hover:text-ink">Sign out</button>
          </form>
        </div>
      </div>
    </aside>
  );
}
