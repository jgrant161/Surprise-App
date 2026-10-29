import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { people, type Person } from "@/db/schema";
import { getHousehold } from "./household";

export const VIEWER_COOKIE = "viewer";

/** The logged-in person, or null. Only members (isMember=1) count. */
export async function getViewer(): Promise<Person | null> {
  const store = await cookies();
  const id = store.get(VIEWER_COOKIE)?.value;
  if (!id) return null;
  const household = await getHousehold();
  const rows = await db
    .select()
    .from(people)
    .where(and(eq(people.id, id), eq(people.householdId, household.id), eq(people.isMember, 1)))
    .limit(1);
  return rows[0] ?? null;
}

/** For pages and actions: redirect to /who when nobody is logged in. */
export async function requireViewer(): Promise<Person> {
  const viewer = await getViewer();
  if (!viewer) redirect("/who");
  return viewer;
}

export function viewerCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  };
}
