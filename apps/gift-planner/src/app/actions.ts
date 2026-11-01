"use server";

import { and, eq, isNull, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { people, ideas, occasions, budgets, IDEA_STATUSES, type IdeaStatus } from "@/db/schema";
import { getHousehold } from "@/lib/household";
import { requireViewer } from "@/lib/viewer";
import { assertNotSelf, loadIdeaForViewer } from "@/lib/visibility";
import { parseDollars } from "@/lib/money";
import { parseIdeas } from "@/lib/claude";
import { listPeople } from "@/lib/queries";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const now = () => new Date().toISOString();

async function ctx() {
  const [viewer, household] = await Promise.all([requireViewer(), getHousehold()]);
  return { viewer, household };
}

/* ---------- people ---------- */

export async function createPerson(fd: FormData) {
  const { household } = await ctx();
  const name = str(fd, "name");
  if (!name) return;
  const id = crypto.randomUUID();
  const pin = str(fd, "pin");
  await db.insert(people).values({
    id,
    householdId: household.id,
    name,
    isMember: fd.get("isMember") ? 1 : 0,
    pin: /^\d{4}$/.test(pin) ? pin : null,
    birthday: normalizeBirthday(str(fd, "birthday")),
    interests: str(fd, "interests"),
    sizes: str(fd, "sizes"),
    notes: str(fd, "notes"),
    color: str(fd, "color") || "#f59e0b",
    createdAt: now(),
  });
  revalidatePath("/people");
  redirect(`/people/${id}`);
}

export async function updatePerson(fd: FormData) {
  const { household } = await ctx();
  const id = str(fd, "id");
  const pin = str(fd, "pin");
  await db
    .update(people)
    .set({
      name: str(fd, "name") || undefined,
      isMember: fd.get("isMember") ? 1 : 0,
      pin: pin === "" ? null : /^\d{4}$/.test(pin) ? pin : undefined,
      birthday: normalizeBirthday(str(fd, "birthday")),
      interests: str(fd, "interests"),
      sizes: str(fd, "sizes"),
      notes: str(fd, "notes"),
      color: str(fd, "color") || undefined,
    })
    .where(and(eq(people.id, id), eq(people.householdId, household.id)));
  revalidatePath(`/people/${id}`);
  revalidatePath("/people");
}

export async function deletePerson(fd: FormData) {
  const { viewer, household } = await ctx();
  const id = str(fd, "id");
  if (id === viewer.id) return; // can't delete yourself while signed in
  await db.delete(ideas).where(and(eq(ideas.forPersonId, id), eq(ideas.householdId, household.id)));
  await db.delete(budgets).where(and(eq(budgets.forPersonId, id), eq(budgets.householdId, household.id)));
  await db.delete(occasions).where(and(eq(occasions.forPersonId, id), eq(occasions.householdId, household.id)));
  await db.delete(people).where(and(eq(people.id, id), eq(people.householdId, household.id)));
  revalidatePath("/people");
  redirect("/people");
}

function normalizeBirthday(s: string): string | null {
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s) || /^\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

/* ---------- ideas ---------- */

export async function createIdea(fd: FormData) {
  const { viewer, household } = await ctx();
  const forPersonId = str(fd, "forPersonId");
  const title = str(fd, "title");
  if (!forPersonId || !title) return;
  assertNotSelf(viewer.id, forPersonId);
  const url = str(fd, "url");
  await db.insert(ideas).values({
    id: crypto.randomUUID(),
    householdId: household.id,
    forPersonId,
    title,
    url: url || null,
    priceCents: parseDollars(str(fd, "price")),
    notes: str(fd, "notes"),
    sourceQuote: str(fd, "sourceQuote") || null,
    status: "idea",
    occasionId: str(fd, "occasionId") || null,
    addedByPersonId: viewer.id,
    clicks: 0,
    createdAt: now(),
    updatedAt: now(),
  });
  revalidatePath(`/people/${forPersonId}`);
  revalidatePath("/");
}

export async function setIdeaStatus(fd: FormData) {
  const { viewer, household } = await ctx();
  const idea = await loadIdeaForViewer(str(fd, "id"), viewer.id, household.id);
  const status = str(fd, "status") as IdeaStatus;
  if (!IDEA_STATUSES.includes(status)) return;
  await db
    .update(ideas)
    .set({
      status,
      givenYear: status === "given" ? new Date().getFullYear() : null,
      // moving something forward implicitly claims it
      claimedByPersonId: status === "idea" ? idea.claimedByPersonId : idea.claimedByPersonId ?? viewer.id,
      updatedAt: now(),
    })
    .where(eq(ideas.id, idea.id));
  revalidatePath(`/people/${idea.forPersonId}`);
  revalidatePath("/");
  revalidatePath("/history");
}

export async function claimIdea(fd: FormData) {
  const { viewer, household } = await ctx();
  const idea = await loadIdeaForViewer(str(fd, "id"), viewer.id, household.id);
  const release = fd.get("release") === "1";
  await db
    .update(ideas)
    .set({ claimedByPersonId: release ? null : viewer.id, updatedAt: now() })
    .where(eq(ideas.id, idea.id));
  revalidatePath(`/people/${idea.forPersonId}`);
}

export async function deleteIdea(fd: FormData) {
  const { viewer, household } = await ctx();
  const idea = await loadIdeaForViewer(str(fd, "id"), viewer.id, household.id);
  await db.delete(ideas).where(eq(ideas.id, idea.id));
  revalidatePath(`/people/${idea.forPersonId}`);
  revalidatePath("/");
}

/* ---------- capture ---------- */

export type CaptureReviewItem = {
  key: string;
  title: string;
  notes: string;
  sourceQuote: string | null;
  priceCents: number | null;
  personId: string | null;
};

export type CaptureResult =
  | { ok: true; text: string; demo: boolean; items: CaptureReviewItem[]; hiddenCount: number }
  | { ok: false; error: string };

export async function captureIdeas(_prev: CaptureResult | null, fd: FormData): Promise<CaptureResult> {
  const { viewer, household } = await ctx();
  const text = str(fd, "text");
  if (!text) return { ok: false, error: "Type or paste what someone said first." };
  const roster = await listPeople(household.id);
  try {
    const result = await parseIdeas({
      text,
      people: roster.map((p) => ({ id: p.id, name: p.name, interests: p.interests })),
    });
    const byName = new Map(roster.map((p) => [p.name.toLowerCase(), p.id]));
    let hiddenCount = 0;
    const items: CaptureReviewItem[] = [];
    for (const idea of result.ideas) {
      const personId = idea.personName ? byName.get(idea.personName.toLowerCase()) ?? null : null;
      if (personId === viewer.id) { hiddenCount++; continue; } // never show the viewer their own surprises
      items.push({
        key: crypto.randomUUID(),
        title: idea.title,
        notes: idea.notes ?? "",
        sourceQuote: idea.sourceQuote,
        priceCents: idea.estimatedPriceCents,
        personId,
      });
    }
    return { ok: true, text, demo: result.demo, items, hiddenCount };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

export async function saveCapturedIdeas(fd: FormData) {
  const { viewer, household } = await ctx();
  const keys = fd.getAll("keep").map(String);
  let saved = 0;
  for (const key of keys) {
    const title = str(fd, `title_${key}`);
    const forPersonId = str(fd, `person_${key}`);
    if (!title || !forPersonId) continue;
    if (forPersonId === viewer.id) continue; // silently drop, server-side guard
    await db.insert(ideas).values({
      id: crypto.randomUUID(),
      householdId: household.id,
      forPersonId,
      title,
      url: null,
      priceCents: parseDollars(str(fd, `price_${key}`)),
      notes: str(fd, `notes_${key}`),
      sourceQuote: str(fd, `quote_${key}`) || null,
      status: "idea",
      occasionId: null,
      addedByPersonId: viewer.id,
      clicks: 0,
      createdAt: now(),
      updatedAt: now(),
    });
    saved++;
  }
  revalidatePath("/");
  revalidatePath("/people");
  redirect(`/people?saved=${saved}`);
}

/* ---------- occasions & budgets ---------- */

export async function createOccasion(fd: FormData) {
  const { household } = await ctx();
  const name = str(fd, "name");
  const date = str(fd, "date");
  if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  await db.insert(occasions).values({
    id: crypto.randomUUID(),
    householdId: household.id,
    name,
    date,
    yearly: fd.get("yearly") ? 1 : 0,
    forPersonId: str(fd, "forPersonId") || null,
    createdAt: now(),
  });
  revalidatePath("/occasions");
  revalidatePath("/");
}

export async function updateOccasion(fd: FormData) {
  const { household } = await ctx();
  const id = str(fd, "id");
  const date = str(fd, "date");
  await db
    .update(occasions)
    .set({
      name: str(fd, "name") || undefined,
      date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
      yearly: fd.get("yearly") ? 1 : 0,
      forPersonId: str(fd, "forPersonId") || null,
    })
    .where(and(eq(occasions.id, id), eq(occasions.householdId, household.id)));
  revalidatePath(`/occasions/${id}`);
  revalidatePath("/occasions");
  revalidatePath("/");
}

export async function deleteOccasion(fd: FormData) {
  const { household } = await ctx();
  const id = str(fd, "id");
  await db.update(ideas).set({ occasionId: null }).where(and(eq(ideas.occasionId, id), eq(ideas.householdId, household.id)));
  await db.delete(budgets).where(and(eq(budgets.occasionId, id), eq(budgets.householdId, household.id)));
  await db.delete(occasions).where(and(eq(occasions.id, id), eq(occasions.householdId, household.id)));
  revalidatePath("/occasions");
  revalidatePath("/");
  redirect("/occasions");
}

/** Adds a yearly birthday occasion for every person with a birthday who lacks one. */
export async function createBirthdayOccasions() {
  const { household } = await ctx();
  const roster = await listPeople(household.id);
  const existing = await db
    .select({ forPersonId: occasions.forPersonId })
    .from(occasions)
    .where(and(eq(occasions.householdId, household.id), eq(occasions.yearly, 1), isNotNull(occasions.forPersonId)));
  const have = new Set(existing.map((o) => o.forPersonId));
  const year = new Date().getFullYear();
  const rows = roster
    .filter((p) => p.birthday && !have.has(p.id))
    .map((p) => ({
      id: crypto.randomUUID(),
      householdId: household.id,
      name: `${p.name}'s birthday`,
      date: p.birthday!.length === 5 ? `${year}-${p.birthday}` : p.birthday!,
      yearly: 1,
      forPersonId: p.id,
      createdAt: now(),
    }));
  if (rows.length) await db.insert(occasions).values(rows);
  revalidatePath("/occasions");
  revalidatePath("/");
}

export async function setBudget(fd: FormData) {
  const { viewer, household } = await ctx();
  const forPersonId = str(fd, "forPersonId");
  const occasionId = str(fd, "occasionId") || null;
  if (!forPersonId) return;
  assertNotSelf(viewer.id, forPersonId);
  const amountCents = parseDollars(str(fd, "amount"));
  const where = and(
    eq(budgets.householdId, household.id),
    eq(budgets.forPersonId, forPersonId),
    occasionId ? eq(budgets.occasionId, occasionId) : isNull(budgets.occasionId),
  );
  if (amountCents == null) {
    await db.delete(budgets).where(where);
  } else {
    const existing = await db.select({ id: budgets.id }).from(budgets).where(where).limit(1);
    if (existing[0]) await db.update(budgets).set({ amountCents }).where(eq(budgets.id, existing[0].id));
    else await db.insert(budgets).values({ id: crypto.randomUUID(), householdId: household.id, forPersonId, occasionId, amountCents });
  }
  revalidatePath(occasionId ? `/occasions/${occasionId}` : "/occasions");
  revalidatePath("/");
}


