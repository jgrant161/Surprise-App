import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { budgets, captures, households, householdUsers, ideas, occasions, people, sessions, users, type Household, type Person } from "@/db/schema";
import { generateInviteCode, isValidInviteCode, normalizeInviteCode } from "./codes";

export class HouseholdError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const now = () => new Date().toISOString();

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateInviteCode();
    const clash = await db.query.households.findFirst({ where: eq(households.inviteCode, code), columns: { id: true } });
    if (!clash) return code;
  }
  throw new Error("Could not allocate an invite code");
}

async function assertNoHousehold(userId: string) {
  const link = await db.query.householdUsers.findFirst({ where: eq(householdUsers.userId, userId) });
  if (link) throw new HouseholdError("You are already in a household. Leave it first to create or join another.");
}

function cleanName(raw: string, what: string, max = 60): string {
  const name = raw.trim().slice(0, max);
  if (!name) throw new HouseholdError(`Give ${what} a name.`);
  return name;
}

/** Create a household, the owner's own `people` row, and the seat linking them. */
export async function createHousehold(userId: string, rawName: string, rawYourName: string): Promise<{ household: Household; person: Person }> {
  await assertNoHousehold(userId);
  const name = cleanName(rawName, "your household");
  const yourName = cleanName(rawYourName, "yourself", 40);
  const householdId = crypto.randomUUID();
  const personId = crypto.randomUUID();
  const ts = now();
  await db.insert(households).values({ id: householdId, name, inviteCode: await uniqueInviteCode(), plan: "free", createdAt: ts });
  await db.insert(people).values({ id: personId, householdId, name: yourName, isMember: 1, color: "#d9486b", createdAt: ts });
  await db.insert(householdUsers).values({ householdId, userId, personId, role: "owner", createdAt: ts });
  const household = (await db.query.households.findFirst({ where: eq(households.id, householdId) }))!;
  const person = (await db.query.people.findFirst({ where: eq(people.id, personId) }))!;
  return { household, person };
}

/** What a joiner sees after typing a code: the household name and the people they could "be". */
export async function lookupInvite(rawCode: string): Promise<{ household: Household; claimable: Pick<Person, "id" | "name" | "color">[] }> {
  const code = normalizeInviteCode(rawCode);
  if (!isValidInviteCode(code)) throw new HouseholdError("That invite code doesn't look right.");
  const household = await db.query.households.findFirst({ where: eq(households.inviteCode, code) });
  if (!household) throw new HouseholdError("No household with that invite code.", 404);
  const claimable = await db
    .select({ id: people.id, name: people.name, color: people.color })
    .from(people)
    .where(and(eq(people.householdId, household.id), eq(people.isMember, 0)))
    .orderBy(people.name);
  return { household, claimable };
}

/**
 * Join with an invite code, either as an existing non-member person (personId) or as a new
 * person (yourName). The person becomes a member so their own gifts are hidden from them.
 */
export async function joinHousehold(
  userId: string,
  rawCode: string,
  opts: { personId?: string | null; yourName?: string | null },
): Promise<{ household: Household; person: Person }> {
  await assertNoHousehold(userId);
  const { household } = await lookupInvite(rawCode);
  const ts = now();
  let person: Person | undefined;
  if (opts.personId) {
    person = await db.query.people.findFirst({ where: and(eq(people.id, opts.personId), eq(people.householdId, household.id)) });
    if (!person) throw new HouseholdError("That person isn't in this household.", 404);
    if (person.isMember === 1) throw new HouseholdError("Someone already signs in as that person. Pick another or add yourself.");
    await db.update(people).set({ isMember: 1 }).where(eq(people.id, person.id));
    person = { ...person, isMember: 1 };
  } else {
    const yourName = cleanName(opts.yourName ?? "", "yourself", 40);
    const id = crypto.randomUUID();
    await db.insert(people).values({ id, householdId: household.id, name: yourName, isMember: 1, color: "#8b5cf6", createdAt: ts });
    person = (await db.query.people.findFirst({ where: eq(people.id, id) }))!;
  }
  await db.insert(householdUsers).values({ householdId: household.id, userId, personId: person.id, role: "member", createdAt: ts });
  return { household, person };
}

export async function regenerateInviteCode(householdId: string): Promise<string> {
  const code = await uniqueInviteCode();
  await db.update(households).set({ inviteCode: code }).where(eq(households.id, householdId));
  return code;
}

export async function householdUserCount(householdId: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(householdUsers).where(eq(householdUsers.householdId, householdId));
  return row?.n ?? 0;
}

export async function listHouseholdUsers(householdId: string) {
  return db
    .select({ userId: users.id, email: users.email, role: householdUsers.role, personId: householdUsers.personId, personName: people.name, personColor: people.color, joinedAt: householdUsers.createdAt })
    .from(householdUsers)
    .innerJoin(users, eq(users.id, householdUsers.userId))
    .innerJoin(people, eq(people.id, householdUsers.personId))
    .where(eq(householdUsers.householdId, householdId));
}

/** True when a signed-in user is seated as this person (so the person can't be deleted). */
export async function personHasUser(householdId: string, personId: string): Promise<boolean> {
  const link = await db.query.householdUsers.findFirst({ where: and(eq(householdUsers.householdId, householdId), eq(householdUsers.personId, personId)) });
  return !!link;
}

/** Everything a household owns. The old tables have no FK cascade, so delete by hand. */
export async function deleteHousehold(householdId: string) {
  await db.delete(captures).where(eq(captures.householdId, householdId));
  await db.delete(budgets).where(eq(budgets.householdId, householdId));
  await db.delete(ideas).where(eq(ideas.householdId, householdId));
  await db.delete(occasions).where(eq(occasions.householdId, householdId));
  await db.delete(people).where(eq(people.householdId, householdId));
  await db.delete(householdUsers).where(eq(householdUsers.householdId, householdId));
  await db.delete(households).where(eq(households.id, householdId));
}

/** Remove the user's seat. Their person row stays as a recipient. Last one out deletes the household. */
export async function leaveHousehold(userId: string, householdId: string) {
  const link = await db.query.householdUsers.findFirst({ where: and(eq(householdUsers.userId, userId), eq(householdUsers.householdId, householdId)) });
  if (!link) return;
  await db.delete(householdUsers).where(and(eq(householdUsers.userId, userId), eq(householdUsers.householdId, householdId)));
  const remaining = await householdUserCount(householdId);
  if (remaining === 0) {
    await deleteHousehold(householdId);
    return;
  }
  await db.update(people).set({ isMember: 0 }).where(eq(people.id, link.personId));
  const owner = await db.query.householdUsers.findFirst({ where: and(eq(householdUsers.householdId, householdId), eq(householdUsers.role, "owner")) });
  if (!owner) {
    const next = await db.query.householdUsers.findFirst({ where: eq(householdUsers.householdId, householdId) });
    if (next) await db.update(householdUsers).set({ role: "owner" }).where(and(eq(householdUsers.householdId, householdId), eq(householdUsers.userId, next.userId)));
  }
}

/** Delete the account and everything only it owned. */
export async function deleteAccount(userId: string) {
  const links = await db.query.householdUsers.findMany({ where: eq(householdUsers.userId, userId) });
  for (const l of links) await leaveHousehold(userId, l.householdId);
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}
