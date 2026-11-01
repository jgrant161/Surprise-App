import { db } from "../src/db";
import { households, people, occasions, ideas, budgets } from "../src/db/schema";

const now = new Date().toISOString();
const uid = () => crypto.randomUUID();

async function main() {
  await db.delete(budgets);
  await db.delete(ideas);
  await db.delete(occasions);
  await db.delete(people);
  await db.delete(households);

  const householdId = uid();
  await db.insert(households).values({ id: householdId, name: "The Grants", createdAt: now });

  const mom = { id: uid(), name: "Mom", isMember: 1, pin: "1234", birthday: "1984-03-14", interests: "gardening, mystery novels, tea", sizes: "M tops, 8 shoes", notes: "", color: "#ec4899" };
  const dad = { id: uid(), name: "Dad", isMember: 1, pin: "1234", birthday: "1982-08-02", interests: "grilling, chess, trading cards", sizes: "L tops, 11 shoes", notes: "", color: "#3b82f6" };
  const ava = { id: uid(), name: "Ava", isMember: 0, pin: null, birthday: "2015-11-20", interests: "art supplies, horses, graphic novels", sizes: "Kids 10-12", notes: "", color: "#8b5cf6" };
  const jake = { id: uid(), name: "Jake", isMember: 0, pin: null, birthday: "2013-01-09", interests: "LEGO, Pokémon cards, soccer", sizes: "Kids 14", notes: "Already has the Hogwarts castle", color: "#22c55e" };
  const jo = { id: uid(), name: "Grandma Jo", isMember: 0, pin: null, birthday: "06-30", interests: "puzzles, birds, cozy socks", sizes: "", notes: "Lives alone, loves phone calls more than things", color: "#f59e0b" };
  const all = [mom, dad, ava, jake, jo];
  await db.insert(people).values(all.map((p) => ({ ...p, householdId, createdAt: now })));

  const year = new Date().getFullYear();
  const christmasId = uid();
  const occRows = [
    { id: christmasId, householdId, name: "Christmas", date: `${year}-12-25`, yearly: 1, forPersonId: null, createdAt: now },
    ...all.map((p) => ({
      id: uid(),
      householdId,
      name: `${p.name}'s birthday`,
      date: p.birthday!.length === 5 ? `${year}-${p.birthday}` : p.birthday!,
      yearly: 1,
      forPersonId: p.id,
      createdAt: now,
    })),
  ];
  await db.insert(occasions).values(occRows);

  const idea = (forPersonId: string, addedBy: string, title: string, extra: Partial<typeof ideas.$inferInsert> = {}) => ({
    id: uid(),
    householdId,
    forPersonId,
    title,
    url: null,
    priceCents: null,
    notes: "",
    sourceQuote: null,
    status: "idea" as const,
    claimedByPersonId: null,
    occasionId: null,
    addedByPersonId: addedBy,
    givenYear: null,
    clicks: 0,
    createdAt: now,
    updatedAt: now,
    ...extra,
  });

  await db.insert(ideas).values([
    idea(ava.id, mom.id, "Watercolor pencil set (72)", { url: "https://www.amazon.com/dp/B07C4VNXHQ", priceCents: 3499, status: "planned", claimedByPersonId: mom.id, occasionId: christmasId, sourceQuote: "I wish I had the fancy pencils like at school" }),
    idea(ava.id, dad.id, "Horse riding lesson gift card", { priceCents: 6500, notes: "Sunny Acres stables, 2 lessons" }),
    idea(ava.id, mom.id, "Nimona graphic novel", { url: "https://www.amazon.com/dp/0062278231", priceCents: 1299, status: "bought", claimedByPersonId: dad.id, occasionId: christmasId }),
    idea(jake.id, dad.id, "LEGO Icons Rivendell", { url: "https://www.amazon.com/dp/B0BXQ3BZ8C", priceCents: 49999, sourceQuote: "keeps talking about the Lego Rivendell set", occasionId: christmasId }),
    idea(jake.id, mom.id, "Pokémon 151 booster bundle", { priceCents: 2999, status: "wrapped", claimedByPersonId: mom.id, occasionId: christmasId }),
    idea(jake.id, mom.id, "Soccer rebounder net", { priceCents: 8900, status: "given", givenYear: year - 1 }),
    idea(mom.id, dad.id, "Garden kneeler and seat", { url: "https://www.amazon.com/dp/B07VNLJ8T8", priceCents: 3999, sourceQuote: "my knees are killing me out there", occasionId: christmasId }),
    idea(mom.id, dad.id, "Louise Penny, latest Gamache novel", { priceCents: 1899, status: "planned", claimedByPersonId: dad.id }),
    idea(dad.id, mom.id, "Chess clock (DGT)", { url: "https://www.amazon.com/dp/B00V5E8V5G", priceCents: 5900, occasionId: christmasId, sourceQuote: "we really need a proper clock for battle chess" }),
    idea(dad.id, mom.id, "Grill tool set", { priceCents: 4500, status: "given", givenYear: year - 1 }),
    idea(jo.id, mom.id, "1000-piece bird puzzle", { priceCents: 1999, status: "bought", claimedByPersonId: mom.id, occasionId: christmasId }),
    idea(jo.id, dad.id, "Wool cozy socks, 3 pack", { priceCents: 2400 }),
  ]);

  await db.insert(budgets).values([
    { id: uid(), householdId, forPersonId: ava.id, occasionId: christmasId, amountCents: 15000 },
    { id: uid(), householdId, forPersonId: jake.id, occasionId: christmasId, amountCents: 15000 },
    { id: uid(), householdId, forPersonId: jo.id, occasionId: christmasId, amountCents: 7500 },
    { id: uid(), householdId, forPersonId: mom.id, occasionId: christmasId, amountCents: 20000 },
    { id: uid(), householdId, forPersonId: dad.id, occasionId: christmasId, amountCents: 20000 },
  ]);

  console.log("Seeded household", householdId);
  console.log("Members: Mom, Dad (PIN 1234). Recipients: Ava, Jake, Grandma Jo.");
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
