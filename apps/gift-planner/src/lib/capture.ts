import type { Household, Person } from "@/db/schema";
import { parseIdeas } from "./claude";
import { recordCapture } from "./plans";
import { listPeople } from "./queries";

export type CaptureReviewItem = {
  key: string;
  title: string;
  notes: string;
  sourceQuote: string | null;
  priceCents: number | null;
  personId: string | null;
};

export type CaptureOutcome = { text: string; demo: boolean; items: CaptureReviewItem[]; hiddenCount: number };

/** Parse a note with Claude, drop anything about the viewer, and count the capture against the plan. */
export async function runCapture({ household, viewer, text }: { household: Pick<Household, "id">; viewer: Pick<Person, "id">; text: string }): Promise<CaptureOutcome> {
  const roster = await listPeople(household.id);
  const result = await parseIdeas({ text, people: roster.map((p) => ({ id: p.id, name: p.name, interests: p.interests })) });
  const byName = new Map(roster.map((p) => [p.name.toLowerCase(), p.id]));
  let hiddenCount = 0;
  const items: CaptureReviewItem[] = [];
  for (const idea of result.ideas) {
    const personId = idea.personName ? byName.get(idea.personName.toLowerCase()) ?? null : null;
    if (personId === viewer.id) { hiddenCount++; continue; } // never show the viewer their own surprises
    items.push({ key: crypto.randomUUID(), title: idea.title, notes: idea.notes ?? "", sourceQuote: idea.sourceQuote, priceCents: idea.estimatedPriceCents, personId });
  }
  await recordCapture(household.id, items.length + hiddenCount);
  return { text, demo: result.demo, items, hiddenCount };
}
