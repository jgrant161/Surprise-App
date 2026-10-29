export function todayISO(): string {
  const d = new Date();
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse 'YYYY-MM-DD' as a local date (avoids UTC off-by-one). */
export function parseISODate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Next occurrence (today or later) of a yearly 'YYYY-MM-DD' or 'MM-DD' date. */
export function nextOccurrence(date: string, yearly: boolean, from = new Date()): Date | null {
  const parts = date.split("-").map(Number);
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  if (parts.length === 2) {
    const [m, d] = parts;
    let next = new Date(today.getFullYear(), m - 1, d);
    if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
    return next;
  }
  const [y, m, d] = parts;
  if (!yearly) {
    const fixed = new Date(y, m - 1, d);
    return fixed >= today ? fixed : null;
  }
  let next = new Date(today.getFullYear(), m - 1, d);
  if (next < today) next = new Date(today.getFullYear() + 1, m - 1, d);
  return next;
}

export function daysUntil(target: Date, from = new Date()): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const b = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatBirthday(b: string | null): string | null {
  if (!b) return null;
  const parts = b.split("-").map(Number);
  const m = parts.length === 2 ? parts[0] : parts[1];
  const d = parts.length === 2 ? parts[1] : parts[2];
  return new Date(2000, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

export function countdownLabel(days: number): string {
  if (days === 0) return "Today!";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}
