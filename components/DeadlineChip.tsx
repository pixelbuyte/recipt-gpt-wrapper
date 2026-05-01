import { cn } from "@/lib/cn";

export function DeadlineChip({ days }: { days: number | null }) {
  if (days === null) return null;
  if (days < 0) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-muted line-through">
        expired
      </span>
    );
  }
  const tone =
    days <= 3
      ? "bg-red-50 text-red-700"
      : days <= 7
      ? "bg-amber-50 text-amber-800"
      : "bg-gray-100 text-gray-700";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tone)}>
      {days === 0 ? "today" : `${days}d left`}
    </span>
  );
}
