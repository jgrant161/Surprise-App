import { db } from "@/db";
import { households, type Household } from "@/db/schema";

/** v1 is single-household: create it on first use and reuse it afterwards. */
export async function getHousehold(): Promise<Household> {
  const existing = await db.select().from(households).limit(1);
  if (existing[0]) return existing[0];
  const row: Household = {
    id: crypto.randomUUID(),
    name: "Our Family",
    createdAt: new Date().toISOString(),
  };
  await db.insert(households).values(row);
  return row;
}
