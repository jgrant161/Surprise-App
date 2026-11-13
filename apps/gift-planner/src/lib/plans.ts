import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { captures, people, type Household } from "@/db/schema";
import type { Plan } from "./revenuecat";

export const FREE_RECIPIENTS = Number(process.env.FREE_RECIPIENTS ?? 4) || 4;
export const FREE_CAPTURES_PER_MONTH = Number(process.env.FREE_CAPTURES_PER_MONTH ?? 5) || 5;
export const PRO_PRICE_MONTHLY = process.env.PRO_PRICE_MONTHLY || "$2.99";
export const PRO_PRICE_YEARLY = process.env.PRO_PRICE_YEARLY || "$29.99";

export type Allowance = { ok: boolean; used: number; limit: number | null; plan: Plan };

/** Pure decision: may a household on `plan` that has `used` of something do one more? */
export function evaluateAllowance(plan: Plan, used: number, limit: number): Allowance {
  if (plan === "pro") return { ok: true, used, limit: null, plan };
  return { ok: used < limit, used, limit, plan };
}

/** First instant of the current calendar month, UTC, as ISO. */
export function monthStartIso(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function peopleCount(householdId: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(people).where(eq(people.householdId, householdId));
  return row?.n ?? 0;
}

export async function capturesUsedThisMonth(householdId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(captures)
    .where(and(eq(captures.householdId, householdId), gte(captures.createdAt, monthStartIso())));
  return row?.n ?? 0;
}

/** Free households can track up to FREE_RECIPIENTS people (members included). */
export async function canAddPerson(household: Pick<Household, "id" | "plan">): Promise<Allowance> {
  return evaluateAllowance(household.plan, await peopleCount(household.id), FREE_RECIPIENTS);
}

export async function canCapture(household: Pick<Household, "id" | "plan">): Promise<Allowance> {
  return evaluateAllowance(household.plan, await capturesUsedThisMonth(household.id), FREE_CAPTURES_PER_MONTH);
}

export async function recordCapture(householdId: string, ideaCount: number) {
  await db.insert(captures).values({ id: crypto.randomUUID(), householdId, ideaCount, createdAt: new Date().toISOString() });
}
