import { eq, and, count } from "drizzle-orm";
import { db } from "@/db";
import { families, familyUsers, sessions, users, type Family } from "@/db/schema";
import { generateInviteCode, generateToken, isValidInviteCode, normalizeInviteCode } from "./codes";
import { TIMEZONES } from "./palette";

export class FamilyError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

async function uniqueInviteCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generateInviteCode();
    const clash = await db.query.families.findFirst({ where: eq(families.inviteCode, code), columns: { id: true } });
    if (!clash) return code;
  }
  throw new Error("Could not allocate an invite code");
}

async function assertNoFamily(userId: string) {
  const link = await db.query.familyUsers.findFirst({ where: eq(familyUsers.userId, userId) });
  if (link) throw new FamilyError("You are already in a family. Leave it first to create or join another.");
}

export async function createFamily(userId: string, rawName: string, rawTimezone: string): Promise<Family> {
  await assertNoFamily(userId);
  const name = rawName.trim().slice(0, 60);
  if (!name) throw new FamilyError("Give your family a name.");
  const timezone = TIMEZONES.includes(rawTimezone) ? rawTimezone : "America/New_York";
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.insert(families).values({
    id,
    name,
    timezone,
    inviteCode: await uniqueInviteCode(),
    feedToken: generateToken(),
    plan: "free",
    createdAt: now,
  });
  await db.insert(familyUsers).values({ familyId: id, userId, role: "owner", createdAt: now });
  return (await db.query.families.findFirst({ where: eq(families.id, id) }))!;
}

export async function joinFamily(userId: string, rawCode: string): Promise<Family> {
  await assertNoFamily(userId);
  const code = normalizeInviteCode(rawCode);
  if (!isValidInviteCode(code)) throw new FamilyError("That invite code doesn't look right.");
  const family = await db.query.families.findFirst({ where: eq(families.inviteCode, code) });
  if (!family) throw new FamilyError("No family with that invite code.", 404);
  await db.insert(familyUsers).values({ familyId: family.id, userId, role: "member", createdAt: new Date().toISOString() });
  return family;
}

export async function regenerateInviteCode(familyId: string): Promise<string> {
  const code = await uniqueInviteCode();
  await db.update(families).set({ inviteCode: code }).where(eq(families.id, familyId));
  return code;
}

export async function rotateFeedToken(familyId: string): Promise<string> {
  const token = generateToken();
  await db.update(families).set({ feedToken: token }).where(eq(families.id, familyId));
  return token;
}

export async function familyUserCount(familyId: string): Promise<number> {
  const [row] = await db.select({ n: count() }).from(familyUsers).where(eq(familyUsers.familyId, familyId));
  return row?.n ?? 0;
}

export async function listFamilyUsers(familyId: string) {
  return db
    .select({ userId: users.id, email: users.email, role: familyUsers.role, joinedAt: familyUsers.createdAt })
    .from(familyUsers)
    .innerJoin(users, eq(users.id, familyUsers.userId))
    .where(eq(familyUsers.familyId, familyId));
}

/** Remove the user from their family. If they were the last one, the family (and its data) goes too. */
export async function leaveFamily(userId: string, familyId: string) {
  await db.delete(familyUsers).where(and(eq(familyUsers.userId, userId), eq(familyUsers.familyId, familyId)));
  const remaining = await familyUserCount(familyId);
  if (remaining === 0) {
    await db.delete(families).where(eq(families.id, familyId)); // cascades to members/snaps/events
  } else {
    // make sure someone still owns it
    const owner = await db.query.familyUsers.findFirst({ where: and(eq(familyUsers.familyId, familyId), eq(familyUsers.role, "owner")) });
    if (!owner) {
      const next = await db.query.familyUsers.findFirst({ where: eq(familyUsers.familyId, familyId) });
      if (next) await db.update(familyUsers).set({ role: "owner" }).where(and(eq(familyUsers.familyId, familyId), eq(familyUsers.userId, next.userId)));
    }
  }
}

/** Delete the account and everything only it owned. */
export async function deleteAccount(userId: string) {
  const links = await db.query.familyUsers.findMany({ where: eq(familyUsers.userId, userId) });
  for (const l of links) await leaveFamily(userId, l.familyId);
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}
