"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { events, eventMembers } from "@/db/schema";
import { requireFamily } from "@/lib/auth";
import { parseEventForm } from "@/lib/event-form";

export async function updateEvent(eventId: string, _prev: { error: string } | null, form: FormData) {
  const { family } = await requireFamily();
  const parsed = parseEventForm(form);
  if ("error" in parsed) return { error: parsed.error };
  const { memberIds, ...values } = parsed;
  const existing = await db.query.events.findFirst({ where: and(eq(events.id, eventId), eq(events.familyId, family.id)), columns: { id: true } });
  if (!existing) return { error: "Event not found" };
  await db.update(events).set({ ...values, status: "confirmed", updatedAt: new Date().toISOString() }).where(eq(events.id, eventId));
  await db.delete(eventMembers).where(eq(eventMembers.eventId, eventId));
  if (memberIds.length) await db.insert(eventMembers).values(memberIds.map((memberId) => ({ eventId, memberId })));
  revalidatePath("/");
  redirect(`/events/${eventId}`);
}

export async function deleteEvent(eventId: string) {
  const { family } = await requireFamily();
  await db.delete(events).where(and(eq(events.id, eventId), eq(events.familyId, family.id)));
  revalidatePath("/");
  redirect("/");
}
