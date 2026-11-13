import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { ideas } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { ideasVisibleTo } from "@/lib/visibility";
import { affiliateUrl } from "@/lib/affiliate";

/** Outbound shopping link: counts the click, adds the affiliate tag, enforces no-peeking. */
export async function GET(req: NextRequest, ctx: RouteContext<"/go/[ideaId]">) {
  const { ideaId } = await ctx.params;
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url), 303);
  if (!session.household || !session.person) return new NextResponse("Not found", { status: 404 });
  const { household, person: viewer } = session;
  const rows = await db
    .select()
    .from(ideas)
    .where(and(eq(ideas.id, ideaId), ideasVisibleTo(viewer.id, household.id)))
    .limit(1);
  const idea = rows[0];
  if (!idea || !idea.url) return new NextResponse("Not found", { status: 404 });
  await db.update(ideas).set({ clicks: sql`${ideas.clicks} + 1` }).where(eq(ideas.id, idea.id));
  return NextResponse.redirect(affiliateUrl(idea.url), 302);
}
