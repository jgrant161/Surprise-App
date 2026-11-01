/**
 * Wall-clock date helpers. Events are stored as local ISO strings without an offset
 * ("2026-11-03T17:30" or "2026-11-03"), so most work is plain string manipulation.
 */

/** A Date whose UTC fields equal the wall-clock fields in `timezone`. */
export function localNow(timezone: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return new Date(Date.UTC(+get("year"), +get("month") - 1, +get("day"), +get("hour") % 24, +get("minute")));
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function datePart(local: string) {
  return local.slice(0, 10);
}

export function timePart(local: string): string | null {
  return local.length > 10 ? local.slice(11, 16) : null;
}

export function joinLocal(date: string, time: string | null | undefined) {
  return time ? `${date}T${time}` : date;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function formatDayHeading(dateKey: string, todayKey: string) {
  const d = new Date(dateKey + "T00:00:00Z");
  const label = `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
  if (dateKey === todayKey) return `Today · ${label}`;
  if (dateKey === toDateKey(addDays(new Date(todayKey + "T00:00:00Z"), 1))) return `Tomorrow · ${label}`;
  return label;
}

export function formatTime(time: string | null) {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

export function formatEventTime(startsAt: string, endsAt: string | null, allDay: boolean) {
  if (allDay) return "All day";
  const s = formatTime(timePart(startsAt));
  const e = endsAt ? formatTime(timePart(endsAt)) : null;
  return e ? `${s} – ${e}` : s;
}

export function formatLongDate(dateKey: string) {
  const d = new Date(dateKey + "T00:00:00Z");
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
