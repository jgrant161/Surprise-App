"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { families, members } from "@/db/schema";
import { requireFamily } from "@/lib/auth";
import { leaveFamily, regenerateInviteCode, rotateFeedToken } from "@/lib/families";
import { PALETTE, TIMEZONES } from "@/lib/palette";

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function addMember(form: FormData) {
  const { family } = await requireFamily();
  const name = str(form.get("name")).slice(0, 40);
  if (!name) return;
  const color = PALETTE.some((p) => p.hex === str(form.get("color"))) ? str(form.get("color")) : PALETTE[0].hex;
  const role = str(form.get("role")) === "adult" ? "adult" : "kid";
  const count = (await db.query.members.findMany({ where: eq(members.familyId, family.id), columns: { id: true } })).length;
  if (count >= 20) return;
  await db.insert(members).values({ id: crypto.randomUUID(), familyId: family.id, name, color, role, sortOrder: count });
  revalidatePath("/family");
}

export async function updateMember(id: string, form: FormData) {
  const { family } = await requireFamily();
  const name = str(form.get("name")).slice(0, 40);
  if (!name) return;
  const color = PALETTE.some((p) => p.hex === str(form.get("color"))) ? str(form.get("color")) : undefined;
  const role = str(form.get("role")) === "adult" ? "adult" : "kid";
  await db
    .update(members)
    .set({ name, role, ...(color ? { color } : {}) })
    .where(and(eq(members.id, id), eq(members.familyId, family.id)));
  revalidatePath("/family");
  revalidatePath("/");
}

export async function deleteMember(id: string) {
  const { family } = await requireFamily();
  await db.delete(members).where(and(eq(members.id, id), eq(members.familyId, family.id)));
  revalidatePath("/family");
  revalidatePath("/");
}

export async function updateFamily(form: FormData) {
  const { family } = await requireFamily();
  const name = str(form.get("name")).slice(0, 60) || family.name;
  const tz = str(form.get("timezone"));
  await db
    .update(families)
    .set({ name, ...(TIMEZONES.includes(tz) ? { timezone: tz } : {}) })
    .where(eq(families.id, family.id));
  revalidatePath("/family");
  revalidatePath("/");
}

export async function regenerateInvite() {
  const { family, role } = await requireFamily();
  if (role !== "owner") return;
  await regenerateInviteCode(family.id);
  revalidatePath("/family");
}

export async function resetFeedLink() {
  const { family } = await requireFamily();
  await rotateFeedToken(family.id);
  revalidatePath("/subscribe");
}

export async function leaveCurrentFamily() {
  const { user, family } = await requireFamily();
  await leaveFamily(user.id, family.id);
  redirect("/welcome");
}
