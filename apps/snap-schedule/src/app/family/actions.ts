"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { families, members } from "@/db/schema";
import { getFamily } from "@/db/queries";
import { PALETTE, TIMEZONES } from "@/lib/palette";

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");

export async function addMember(form: FormData) {
  const name = str(form.get("name"));
  if (!name) return;
  const family = await getFamily();
  const color = PALETTE.some((p) => p.hex === str(form.get("color"))) ? str(form.get("color")) : PALETTE[0].hex;
  const role = str(form.get("role")) === "adult" ? "adult" : "kid";
  const count = (await db.query.members.findMany({ where: eq(members.familyId, family.id) })).length;
  await db.insert(members).values({ id: crypto.randomUUID(), familyId: family.id, name, color, role, sortOrder: count });
  revalidatePath("/family");
}

export async function updateMember(id: string, form: FormData) {
  const name = str(form.get("name"));
  if (!name) return;
  const color = PALETTE.some((p) => p.hex === str(form.get("color"))) ? str(form.get("color")) : undefined;
  const role = str(form.get("role")) === "adult" ? "adult" : "kid";
  await db.update(members).set({ name, role, ...(color ? { color } : {}) }).where(eq(members.id, id));
  revalidatePath("/family");
  revalidatePath("/");
}

export async function deleteMember(id: string) {
  await db.delete(members).where(eq(members.id, id));
  revalidatePath("/family");
  revalidatePath("/");
}

export async function updateFamily(form: FormData) {
  const family = await getFamily();
  const name = str(form.get("name")) || family.name;
  const tz = str(form.get("timezone"));
  await db
    .update(families)
    .set({ name, ...(TIMEZONES.includes(tz) ? { timezone: tz } : {}) })
    .where(eq(families.id, family.id));
  revalidatePath("/family");
  revalidatePath("/");
}
