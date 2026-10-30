"use server";

import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { events, eventMembers, snaps } from "@/db/schema";
import { getMembers, getSnapWithImage } from "@/db/queries";
import { requireFamily } from "@/lib/auth";
import { parseEventForm } from "@/lib/event-form";
import { clearSnapImage, processSnap } from "@/lib/snaps";

async function saveEvent(familyId: string, form: FormData, eventId: string) {
  const parsed = parseEventForm(form, `${eventId}:`);
  if ("error" in parsed) return parsed.error;
  const { memberIds, ...values } = parsed;
  await db
    .update(events)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(and(eq(events.id, eventId), eq(events.familyId, familyId)));
  await db.delete(eventMembers).where(eq(eventMembers.eventId, eventId));
  if (memberIds.length) await db.insert(eventMembers).values(memberIds.map((memberId) => ({ eventId, memberId })));
  return null;
}

/** Save every draft on the snap and mark them confirmed. */
export async function confirmAll(snapId: string, form: FormData) {
  const { family } = await requireFamily();
  const drafts = await db.query.events.findMany({
    where: and(eq(events.snapId, snapId), eq(events.familyId, family.id), eq(events.status, "draft")),
  });
  for (const d of drafts) {
    const err = await saveEvent(family.id, form, d.id);
    if (err) return { error: `${d.title}: ${err}` };
  }
  await db.update(events).set({ status: "confirmed" }).where(and(eq(events.snapId, snapId), eq(events.familyId, family.id)));
  await db.update(snaps).set({ status: "confirmed" }).where(and(eq(snaps.id, snapId), eq(snaps.familyId, family.id)));
  await clearSnapImage(snapId);
  revalidatePath("/");
  redirect("/");
}

export async function deleteDraft(snapId: string, eventId: string) {
  const { family } = await requireFamily();
  await db.delete(events).where(and(eq(events.id, eventId), eq(events.snapId, snapId), eq(events.familyId, family.id)));
  revalidatePath(`/snaps/${snapId}/review`);
}

export async function addBlankDraft(snapId: string) {
  const { family } = await requireFamily();
  const snap = await db.query.snaps.findFirst({ where: and(eq(snaps.id, snapId), eq(snaps.familyId, family.id)), columns: { id: true } });
  if (!snap) return;
  const now = new Date().toISOString();
  await db.insert(events).values({
    id: crypto.randomUUID(),
    familyId: family.id,
    snapId,
    title: "New event",
    startsAt: now.slice(0, 10),
    allDay: true,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  });
  revalidatePath(`/snaps/${snapId}/review`);
}

export async function retrySnap(snapId: string) {
  const { family } = await requireFamily();
  const snap = await getSnapWithImage(family.id, snapId);
  if (!snap) return;
  const members = await getMembers(family.id);
  await processSnap(snap, family, members);
  revalidatePath(`/snaps/${snapId}/review`);
}

export async function discardSnap(snapId: string) {
  const { family } = await requireFamily();
  await db.delete(events).where(and(eq(events.snapId, snapId), eq(events.familyId, family.id), eq(events.status, "draft")));
  // keep the row (it counts toward the monthly allowance) but drop the image bytes
  await clearSnapImage(snapId);
  await db.update(snaps).set({ status: "discarded", rawJson: null }).where(and(eq(snaps.id, snapId), eq(snaps.familyId, family.id)));
  revalidatePath("/");
  redirect("/snap");
}
