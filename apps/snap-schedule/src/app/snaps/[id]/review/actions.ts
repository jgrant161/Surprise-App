"use server";

import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { events, eventMembers, snaps } from "@/db/schema";
import { getFamily, getMembers } from "@/db/queries";
import { parseEventForm } from "@/lib/event-form";
import { processSnap } from "@/lib/snaps";

async function saveEvent(form: FormData, eventId: string) {
  const parsed = parseEventForm(form, `${eventId}:`);
  if ("error" in parsed) return parsed.error;
  const { memberIds, ...values } = parsed;
  await db.update(events).set({ ...values, updatedAt: new Date().toISOString() }).where(eq(events.id, eventId));
  await db.delete(eventMembers).where(eq(eventMembers.eventId, eventId));
  if (memberIds.length) await db.insert(eventMembers).values(memberIds.map((memberId) => ({ eventId, memberId })));
  return null;
}

/** Save every draft on the snap and mark them confirmed. */
export async function confirmAll(snapId: string, form: FormData) {
  const drafts = await db.query.events.findMany({ where: and(eq(events.snapId, snapId), eq(events.status, "draft")) });
  for (const d of drafts) {
    const err = await saveEvent(form, d.id);
    if (err) return { error: `${d.title}: ${err}` };
  }
  await db.update(events).set({ status: "confirmed" }).where(eq(events.snapId, snapId));
  await db.update(snaps).set({ status: "confirmed" }).where(eq(snaps.id, snapId));
  revalidatePath("/");
  redirect("/");
}

export async function deleteDraft(snapId: string, eventId: string) {
  await db.delete(events).where(and(eq(events.id, eventId), eq(events.snapId, snapId)));
  revalidatePath(`/snaps/${snapId}/review`);
}

export async function addBlankDraft(snapId: string) {
  const snap = await db.query.snaps.findFirst({ where: eq(snaps.id, snapId) });
  if (!snap) return;
  const now = new Date().toISOString();
  await db.insert(events).values({
    id: crypto.randomUUID(),
    familyId: snap.familyId,
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
  const snap = await db.query.snaps.findFirst({ where: eq(snaps.id, snapId) });
  if (!snap) return;
  const family = await getFamily();
  const members = await getMembers(family.id);
  await processSnap(snap, family, members);
  revalidatePath(`/snaps/${snapId}/review`);
}

export async function discardSnap(snapId: string) {
  await db.delete(events).where(and(eq(events.snapId, snapId), eq(events.status, "draft")));
  await db.delete(snaps).where(eq(snaps.id, snapId));
  revalidatePath("/");
  redirect("/snap");
}
