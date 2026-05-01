export function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function parseDollarsToCents(input: string): number {
  const n = Number(input.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(n)) return 0;
  return Math.round(n * 100);
}
