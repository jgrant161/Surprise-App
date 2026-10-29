import { datePart, timePart, addDays, toDateKey } from "./dates";

export type IcsEvent = {
  uid: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  location?: string | null;
  description?: string | null;
  updatedAt: string;
};

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 73) {
    out.push(rest.slice(0, 73));
    rest = " " + rest.slice(73);
  }
  out.push(rest);
  return out.join("\r\n");
}

/** "2026-11-03T17:30" -> "20261103T173000" (floating local time). */
export function toIcsLocal(local: string) {
  const d = datePart(local).replace(/-/g, "");
  const t = timePart(local);
  return t ? `${d}T${t.replace(":", "")}00` : d;
}

export function toIcsStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function eventEnd(e: Pick<IcsEvent, "startsAt" | "endsAt" | "allDay">): string {
  if (e.allDay) {
    const next = addDays(new Date(datePart(e.startsAt) + "T00:00:00Z"), 1);
    return toDateKey(next);
  }
  if (e.endsAt && e.endsAt > e.startsAt) return e.endsAt;
  // default 60 minutes
  const [h, m] = (timePart(e.startsAt) ?? "00:00").split(":").map(Number);
  const base = new Date(datePart(e.startsAt) + "T00:00:00Z");
  base.setUTCHours(h, m + 60);
  return `${toDateKey(base)}T${String(base.getUTCHours()).padStart(2, "0")}:${String(base.getUTCMinutes()).padStart(2, "0")}`;
}

export function buildCalendar(name: string, items: IcsEvent[]) {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Snap Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(name)}`,
  ];
  for (const e of items) {
    const end = eventEnd(e);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.uid}@snapschedule`);
    lines.push(`DTSTAMP:${toIcsStamp(e.updatedAt)}`);
    if (e.allDay) {
      lines.push(`DTSTART;VALUE=DATE:${toIcsLocal(e.startsAt)}`);
      lines.push(`DTEND;VALUE=DATE:${toIcsLocal(end)}`);
    } else {
      lines.push(`DTSTART:${toIcsLocal(e.startsAt)}`);
      lines.push(`DTEND:${toIcsLocal(end)}`);
    }
    lines.push(`SUMMARY:${esc(e.title)}`);
    if (e.location) lines.push(`LOCATION:${esc(e.location)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Reminder", "TRIGGER:-PT60M", "END:VALARM");
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function googleCalendarUrl(e: IcsEvent) {
  const end = eventEnd(e);
  const dates = `${toIcsLocal(e.startsAt)}/${toIcsLocal(end)}`;
  const params = new URLSearchParams({ action: "TEMPLATE", text: e.title, dates });
  if (e.location) params.set("location", e.location);
  if (e.description) params.set("details", e.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
