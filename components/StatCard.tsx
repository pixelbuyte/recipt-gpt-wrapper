import { cn } from "@/lib/cn";

export function StatCard({
  label,
  value,
  sub,
  children,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("card p-5", className)}>
      <div className="text-sm text-muted">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted">{sub}</div> : null}
      {children ? <div className="mt-4 space-y-2">{children}</div> : null}
    </div>
  );
}
