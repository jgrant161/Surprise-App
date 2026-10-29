import { and, asc, eq, gte, inArray, lt } from "drizzle-orm";
import { db } from "./index";
import { events, eventMembers, families, members, snaps, type Event, type Member } from "./schema";
import { localNow, addDays, toDateKey } from "@/lib/dates";

export async function getFamily() {
  const existing = await db.query.families.findFirst();
  if (existing) return existing;
  const id = crypto.randomUUID();
  await db.insert(families).values({
    id,
    name: "My Family",
    timezone: "America/New_York",
    createdAt: new Date().toISOString(),
  });
  return (await db.query.families.findFirst({ where: eq(families.id, id) }))!;
}

export async function getMembers(familyId: string): Promise<Member[]> {
  return db.query.members.findMany({
    where: eq(members.familyId, familyId),
    orderBy: [asc(members.sortOrder), asc(members.name)],
  });
}

export type EventWithPeople = Event & { memberIds: string[]; driver: Member | null };

async function attachPeople(rows: Event[]): Promise<EventWithPeople[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id);
  const links = await db.query.eventMembers.findMany({ where: inArray(eventMembers.eventId, ids) });
  const driverIds = rows.map((r) => r.driverMemberId).filter((x): x is string => !!x);
  const drivers = driverIds.length
    ? await db.query.members.findMany({ where: inArray(members.id, driverIds) })
    : [];
  return rows.map((r) => ({
    ...r,
    memberIds: links.filter((l) => l.eventId === r.id).map((l) => l.memberId),
    driver: drivers.find((d) => d.id === r.driverMemberId) ?? null,
  }));
}

export async function getUpcomingEvents(familyId: string, timezone: string, days = 30) {
  const now = localNow(timezone);
  const from = toDateKey(now);
  const to = toDateKey(addDays(now, days));
  const rows = await db.query.events.findMany({
    where: and(
      eq(events.familyId, familyId),
      eq(events.status, "confirmed"),
      gte(events.startsAt, from),
      lt(events.startsAt, to),
    ),
    orderBy: [asc(events.startsAt)],
  });
  return attachPeople(rows);
}

export async function getConfirmedEvents(familyId: string) {
  const rows = await db.query.events.findMany({
    where: and(eq(events.familyId, familyId), eq(events.status, "confirmed")),
    orderBy: [asc(events.startsAt)],
  });
  return attachPeople(rows);
}

export async function getEvent(id: string) {
  const row = await db.query.events.findFirst({ where: eq(events.id, id) });
  if (!row) return null;
  return (await attachPeople([row]))[0];
}

export async function getSnapEvents(snapId: string) {
  const rows = await db.query.events.findMany({
    where: eq(events.snapId, snapId),
    orderBy: [asc(events.startsAt)],
  });
  return attachPeople(rows);
}

export async function getSnapsNeedingReview(familyId: string) {
  return db.query.snaps.findMany({
    where: and(eq(snaps.familyId, familyId), inArray(snaps.status, ["needs_review", "failed"])),
    columns: { id: true, status: true, kind: true, sourceLabel: true, createdAt: true },
  });
}
