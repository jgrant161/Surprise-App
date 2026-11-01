import { and, eq, isNotNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { events, eventMembers, meta, snaps, type Member, type Snap } from "@/db/schema";
import { extractEvents, type ExtractedEvent } from "@/lib/claude";
import { joinLocal, localNow, toDateKey } from "@/lib/dates";

/** Run (or re-run) extraction for a stored snap and write draft events. */
export async function processSnap(snap: Snap, family: { timezone: string }, members: Member[]) {
  const now = new Date().toISOString();
  await db.update(snaps).set({ status: "processing", errorMessage: null }).where(eq(snaps.id, snap.id));
  // Drop earlier drafts from a failed/retried run.
  await db.delete(events).where(eq(events.snapId, snap.id));

  try {
    const result = await extractEvents({
      image: snap.kind === "image" && snap.image ? { mime: snap.imageMime ?? "image/jpeg", base64: Buffer.from(snap.image).toString("base64") } : undefined,
      text: snap.kind === "text" ? snap.text ?? undefined : undefined,
      today: toDateKey(localNow(family.timezone)),
      timezone: family.timezone,
      memberNames: members.map((m) => m.name),
    });

    for (const ev of result.events) {
      const id = crypto.randomUUID();
      await db.insert(events).values({
        id,
        familyId: snap.familyId,
        snapId: snap.id,
        title: ev.title.trim() || "Untitled",
        startsAt: ev.allDay ? ev.date : joinLocal(ev.date, ev.startTime ?? null),
        endsAt: !ev.allDay && ev.endTime ? joinLocal(ev.date, ev.endTime) : null,
        allDay: ev.allDay,
        location: ev.location,
        notes: ev.notes,
        bring: ev.bring,
        status: "draft",
        confidence: ev.confidence,
        sourceText: ev.sourceText,
        createdAt: now,
        updatedAt: now,
      });
      const ids = matchMembers(ev, members);
      if (ids.length) await db.insert(eventMembers).values(ids.map((memberId) => ({ eventId: id, memberId })));
    }

    await db
      .update(snaps)
      .set({ status: "needs_review", rawJson: JSON.stringify(result), demo: result.demo })
      .where(eq(snaps.id, snap.id));
    return { ok: true as const, count: result.events.length };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    await db.update(snaps).set({ status: "failed", errorMessage: message }).where(eq(snaps.id, snap.id));
    return { ok: false as const, error: message };
  }
}

function matchMembers(ev: ExtractedEvent, members: Member[]) {
  const wanted = ev.members.map((n) => n.trim().toLowerCase()).filter(Boolean);
  return members.filter((m) => wanted.includes(m.name.toLowerCase())).map((m) => m.id);
}

/** Drop the image bytes once a snap is confirmed or discarded; keep the record for history/metering. */
export async function clearSnapImage(snapId: string) {
  await db
    .update(snaps)
    .set({ image: null, imageDeletedAt: new Date().toISOString() })
    .where(and(eq(snaps.id, snapId), isNotNull(snaps.image)));
}

const PURGE_KEY = "last_image_purge";
const PURGE_AGE_DAYS = 7;

/** Delete image bytes from any snap older than 7 days, whatever its status. Safe to run any time. */
export async function purgeStaleSnapImages(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - PURGE_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const stale = await db.query.snaps.findMany({
    where: and(isNotNull(snaps.image), lt(snaps.createdAt, cutoff)),
    columns: { id: true },
  });
  for (const s of stale) await clearSnapImage(s.id);
  return stale.length;
}

/** Run the purge at most once per hour. Called opportunistically from page loads. */
export async function maybePurgeStaleImages(): Promise<void> {
  const row = await db.query.meta.findFirst({ where: eq(meta.key, PURGE_KEY) });
  const last = row ? Date.parse(row.value) : 0;
  if (Date.now() - last < 60 * 60 * 1000) return;
  const nowIso = new Date().toISOString();
  await db.insert(meta).values({ key: PURGE_KEY, value: nowIso }).onConflictDoUpdate({ target: meta.key, set: { value: nowIso } });
  try {
    await purgeStaleSnapImages();
  } catch (err) {
    console.error("image purge failed", err);
  }
}
