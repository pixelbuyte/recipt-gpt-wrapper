import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function daysUntil(dateISO: string | null | undefined): number | null {
  if (!dateISO) return null;
  return differenceInCalendarDays(parseISO(dateISO), new Date());
}

export function fmtDate(dateISO: string | null | undefined): string {
  if (!dateISO) return "—";
  return format(parseISO(dateISO), "MMM d, yyyy");
}

export function todayISO(): string {
  // Use local Y/M/D so the client returns the user's local "today" instead
  // of UTC (which can be off by one in negative offsets during evening).
  // On the server (Vercel runs UTC) this still produces a stable threshold.
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Operates purely on the YYYY-MM-DD parts in UTC so the result is independent
// of the runtime timezone. Mixing parseISO (local midnight) with toISOString
// (UTC) shifts the date by one in negative UTC offsets.
export function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}
