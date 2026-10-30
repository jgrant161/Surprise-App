import { eq } from "drizzle-orm";
import { db } from "@/db";
import { families } from "@/db/schema";
import { planForEvent, type RevenueCatEvent } from "@/lib/revenuecat";

/**
 * RevenueCat -> plan sync. Configure the webhook in RevenueCat with
 * Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>. app_user_id must be the family id
 * (the native shell logs in to RevenueCat with the family id after sign-in).
 */
export async function POST(req: Request) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  const auth = req.headers.get("authorization") ?? "";
  if (!secret || auth !== `Bearer ${secret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await req.json().catch(() => null)) as { event?: RevenueCatEvent } | null;
  const event = payload?.event;
  if (!event?.app_user_id) return Response.json({ ok: true, ignored: "no app_user_id" });

  const plan = planForEvent(event);
  if (!plan) return Response.json({ ok: true, ignored: event.type ?? "unknown" });

  const family = await db.query.families.findFirst({ where: eq(families.id, event.app_user_id), columns: { id: true } });
  if (!family) return Response.json({ ok: true, ignored: "unknown family" });

  await db
    .update(families)
    .set({ plan, planSource: "revenuecat", planUpdatedAt: new Date().toISOString() })
    .where(eq(families.id, family.id));
  return Response.json({ ok: true, plan });
}
