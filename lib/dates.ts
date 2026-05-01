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
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(baseISO: string, days: number): string {
  const d = parseISO(baseISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
