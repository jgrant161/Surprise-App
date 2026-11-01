import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { people } from "@/db/schema";
import { getHousehold } from "@/lib/household";
import { VIEWER_COOKIE, viewerCookieOptions } from "@/lib/viewer";

/** Plain-form login so it works without JS and is easy to script. */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const household = await getHousehold();
  const back = (error: string) => NextResponse.redirect(new URL(`/who?error=${encodeURIComponent(error)}`, req.url), 303);

  let personId = String(form.get("personId") ?? "");
  const pin = String(form.get("pin") ?? "").trim();

  if (form.get("createFirst")) {
    const existing = await db.select({ id: people.id }).from(people).where(and(eq(people.householdId, household.id), eq(people.isMember, 1))).limit(1);
    if (existing.length) return back("A member already exists. Pick them above.");
    const name = String(form.get("name") ?? "").trim();
    if (!name) return back("Name is required.");
    if (pin && !/^\d{4}$/.test(pin)) return back("PIN must be 4 digits.");
    personId = crypto.randomUUID();
    await db.insert(people).values({
      id: personId,
      householdId: household.id,
      name,
      isMember: 1,
      pin: pin || null,
      color: "#d9486b",
      createdAt: new Date().toISOString(),
    });
  } else {
    const rows = await db
      .select()
      .from(people)
      .where(and(eq(people.id, personId), eq(people.householdId, household.id), eq(people.isMember, 1)))
      .limit(1);
    const person = rows[0];
    if (!person) return back("That person can't sign in.");
    if (person.pin && person.pin !== pin) return back(`Wrong PIN for ${person.name}.`);
  }

  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(VIEWER_COOKIE, personId, viewerCookieOptions());
  return res;
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/who", req.url), 303);
  res.cookies.delete(VIEWER_COOKIE);
  return res;
}
