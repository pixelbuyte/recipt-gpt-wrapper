"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, ListChecks, Menu, Plus, Settings, X } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/app/purchases", label: "Purchases", icon: ListChecks },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ email, plan }: { email: string; plan: "free" | "pro" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <MobileBar onOpen={() => setOpen(true)} />

      {open ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-white p-4 transition-transform md:sticky md:top-0 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 flex items-center justify-between md:mb-8">
          <Link href="/app" className="flex items-center gap-2 px-2">
            <div className="h-7 w-7 rounded-md bg-accent" />
            <span className="text-base font-semibold tracking-tight">Purchase Ping</span>
          </Link>
          <button
            aria-label="Close menu"
            className="rounded-md p-1 text-muted hover:text-ink md:hidden"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

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

        <Link href="/app/purchases/new" className="btn-primary mt-6 w-full">
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
    </>
  );
}

function MobileBar({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:hidden">
      <button
        aria-label="Open menu"
        onClick={onOpen}
        className="-ml-1 rounded-md p-2 text-ink hover:bg-gray-100"
      >
        <Menu className="h-5 w-5" />
      </button>
      <Link href="/app" className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md bg-accent" />
        <span className="text-sm font-semibold">Purchase Ping</span>
      </Link>
      <Link
        href="/app/purchases/new"
        aria-label="Add purchase"
        className="rounded-md p-2 text-accent hover:bg-accent-50"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </div>
  );
}
