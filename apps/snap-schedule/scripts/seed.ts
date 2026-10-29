import { db } from "../src/db";
import { families, members } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  let family = await db.query.families.findFirst();
  if (!family) {
    const id = crypto.randomUUID();
    await db.insert(families).values({
      id,
      name: "My Family",
      timezone: "America/New_York",
      createdAt: new Date().toISOString(),
    });
    family = (await db.query.families.findFirst({ where: eq(families.id, id) }))!;
  }
  const existing = await db.query.members.findMany({ where: eq(members.familyId, family.id) });
  if (existing.length) {
    console.log(`Family "${family.name}" already has ${existing.length} members, skipping.`);
    return;
  }
  const seed = [
    { name: "Mom", color: "#ec4899", role: "adult" as const },
    { name: "Dad", color: "#6366f1", role: "adult" as const },
    { name: "Ava", color: "#2dd4bf", role: "kid" as const },
    { name: "Jake", color: "#fb923c", role: "kid" as const },
  ];
  await db.insert(members).values(
    seed.map((m, i) => ({ id: crypto.randomUUID(), familyId: family!.id, sortOrder: i, ...m })),
  );
  console.log(`Seeded ${seed.length} members into "${family.name}".`);
}

main().then(() => process.exit(0));
