import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { families, familyUsers, members, users } from "../src/db/schema";
import { generateInviteCode, generateToken } from "../src/lib/codes";

/**
 * Creates a demo account you can sign in with (dev mode shows the code on the login page):
 *   demo@flyercal.app -> family "The Demo Family" (Mom, Dad, Ava, Jake)
 * For App Review, set REVIEW_EMAIL / REVIEW_CODE in the environment; that email accepts the fixed code.
 */
async function main() {
  const email = "demo@flyercal.app";
  const now = new Date().toISOString();
  let user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) {
    const id = crypto.randomUUID();
    await db.insert(users).values({ id, email, createdAt: now });
    user = (await db.query.users.findFirst({ where: eq(users.id, id) }))!;
  }
  const link = await db.query.familyUsers.findFirst({ where: eq(familyUsers.userId, user.id) });
  if (link) {
    const fam = await db.query.families.findFirst({ where: eq(families.id, link.familyId) });
    console.log(`Demo user ${email} already in "${fam?.name}" (invite ${fam?.inviteCode}). Nothing to do.`);
    return;
  }
  const familyId = crypto.randomUUID();
  const inviteCode = generateInviteCode();
  await db.insert(families).values({
    id: familyId,
    name: "The Demo Family",
    timezone: "America/New_York",
    inviteCode,
    feedToken: generateToken(),
    plan: "free",
    createdAt: now,
  });
  await db.insert(familyUsers).values({ familyId, userId: user.id, role: "owner", createdAt: now });
  const seed = [
    { name: "Mom", color: "#ec4899", role: "adult" as const },
    { name: "Dad", color: "#6366f1", role: "adult" as const },
    { name: "Ava", color: "#2dd4bf", role: "kid" as const },
    { name: "Jake", color: "#fb923c", role: "kid" as const },
  ];
  await db.insert(members).values(seed.map((m, i) => ({ id: crypto.randomUUID(), familyId, sortOrder: i, ...m })));
  console.log(`Seeded ${email} -> "The Demo Family" with ${seed.length} members. Invite code: ${inviteCode}`);
  if (process.env.REVIEW_EMAIL && process.env.REVIEW_CODE) {
    console.log(`Reviewer login: ${process.env.REVIEW_EMAIL} with code ${process.env.REVIEW_CODE}`);
  }
}

main().then(() => process.exit(0));
