import { and, count, eq, gte, ne } from "drizzle-orm";
import { db } from "@/db";
import { snaps, type Family } from "@/db/schema";
import type { Plan } from "./revenuecat";

export const FREE_SNAPS_PER_MONTH = Number(process.env.FREE_SNAPS_PER_MONTH ?? 5) || 5;

export type SnapAllowance = { ok: boolean; used: number; limit: number | null; plan: Plan };

/** Pure decision: can a family with `plan` that has `used` snaps this month snap again? */
export function evaluateSnapAllowance(plan: Plan, used: number, limit = FREE_SNAPS_PER_MONTH): SnapAllowance {
  if (plan === "pro") return { ok: true, used, limit: null, plan };
  return { ok: used < limit, used, limit, plan };
}

/** First instant of the current calendar month, UTC, as ISO. */
export function monthStartIso(now = new Date()): string {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function snapsUsedThisMonth(familyId: string): Promise<number> {
  const [row] = await db
    .select({ n: count() })
    .from(snaps)
    // failed extractions don't cost a snap; discarded ones do (otherwise discard+retry is a free loop)
    .where(and(eq(snaps.familyId, familyId), gte(snaps.createdAt, monthStartIso()), ne(snaps.status, "failed")));
  return row?.n ?? 0;
}

export async function canSnap(family: Pick<Family, "id" | "plan">): Promise<SnapAllowance> {
  const used = await snapsUsedThisMonth(family.id);
  return evaluateSnapAllowance(family.plan, used);
}

export const PRO_PRICE_MONTHLY = process.env.PRO_PRICE_MONTHLY || "$3.99";
export const PRO_PRICE_YEARLY = process.env.PRO_PRICE_YEARLY || "$39.99";
