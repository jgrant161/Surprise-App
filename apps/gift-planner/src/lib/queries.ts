import { and, eq, asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { people, ideas, occasions, budgets, type Idea, type Person, type Occasion, type Budget } from "@/db/schema";
import { ideasVisibleTo, hideSelf } from "./visibility";

export async function listPeople(householdId: string): Promise<Person[]> {
  return db.select().from(people).where(eq(people.householdId, householdId)).orderBy(asc(people.name));
}

export async function getPerson(householdId: string, id: string): Promise<Person | null> {
  const rows = await db.select().from(people).where(and(eq(people.id, id), eq(people.householdId, householdId))).limit(1);
  return rows[0] ?? null;
}

/** Every idea the viewer may see (never their own). */
export async function listVisibleIdeas(viewerId: string, householdId: string): Promise<Idea[]> {
  const rows = await db.select().from(ideas).where(ideasVisibleTo(viewerId, householdId)).orderBy(desc(ideas.updatedAt));
  return hideSelf(viewerId, rows);
}

export async function listOccasions(householdId: string): Promise<Occasion[]> {
  return db.select().from(occasions).where(eq(occasions.householdId, householdId)).orderBy(asc(occasions.date));
}

export async function getOccasion(householdId: string, id: string): Promise<Occasion | null> {
  const rows = await db.select().from(occasions).where(and(eq(occasions.id, id), eq(occasions.householdId, householdId))).limit(1);
  return rows[0] ?? null;
}

/** Budgets, with the viewer's own rows removed (budgets for them are a spoiler too). */
export async function listVisibleBudgets(viewerId: string, householdId: string): Promise<Budget[]> {
  const rows = await db.select().from(budgets).where(eq(budgets.householdId, householdId));
  return hideSelf(viewerId, rows);
}

export const SPENT_STATUSES = new Set(["bought", "wrapped", "given"]);

/** Money committed for a person (optionally one occasion) this year. */
export function spentFor(all: Idea[], personId: string, occasionId: string | null, year: number): number {
  return all
    .filter((i) => i.forPersonId === personId && SPENT_STATUSES.has(i.status))
    .filter((i) => (occasionId ? i.occasionId === occasionId : true))
    .filter((i) => i.status !== "given" || i.givenYear === year)
    .reduce((sum, i) => sum + (i.priceCents ?? 0), 0);
}

export type Pipeline = { idea: number; planned: number; bought: number; wrapped: number; given: number; total: number };

export function pipelineFor(all: Idea[], personId: string, occasionId?: string | null): Pipeline {
  const p: Pipeline = { idea: 0, planned: 0, bought: 0, wrapped: 0, given: 0, total: 0 };
  for (const i of all) {
    if (i.forPersonId !== personId) continue;
    if (occasionId && i.occasionId && i.occasionId !== occasionId) continue;
    if (i.status === "given") { p.given++; continue; }
    p[i.status]++;
    p.total++;
  }
  return p;
}

export function personMap(list: Person[]): Map<string, Person> {
  return new Map(list.map((p) => [p.id, p]));
}
