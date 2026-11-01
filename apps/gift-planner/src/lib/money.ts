export function formatCents(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** "12.50" | "$12" | "" -> cents | null */
export function parseDollars(input: string | null | undefined): number | null {
  if (!input) return null;
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}

export function centsToDollarInput(cents: number | null | undefined): string {
  return cents == null ? "" : (cents / 100).toFixed(2);
}
