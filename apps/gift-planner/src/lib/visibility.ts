import { and, eq, ne, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { ideas, type Idea } from "@/db/schema";

/**
 * THE privacy rule of this app: a viewer never sees gifts meant for them.
 * Every read of `ideas` goes through `ideasVisibleTo`, every write through `assertCanTouchIdea`.
 */

/** Drizzle `where` fragment: ideas in this household that are NOT for the viewer. */
export function ideasVisibleTo(viewerId: string, householdId: string): SQL {
  return and(eq(ideas.householdId, householdId), ne(ideas.forPersonId, viewerId))!;
}

/** Defensive second pass for anything already loaded into memory. */
export function hideSelf<T extends { forPersonId: string }>(viewerId: string, rows: T[]): T[] {
  return rows.filter((r) => r.forPersonId !== viewerId);
}

export function isSelf(viewerId: string, personId: string): boolean {
  return viewerId === personId;
}

export class NoPeekingError extends Error {
  constructor() {
    super("No peeking: that gift is for you.");
    this.name = "NoPeekingError";
  }
}

/** Load an idea the viewer is allowed to see and change; throws otherwise. */
export async function loadIdeaForViewer(
  ideaId: string,
  viewerId: string,
  householdId: string,
): Promise<Idea> {
  const rows = await db
    .select()
    .from(ideas)
    .where(and(eq(ideas.id, ideaId), ideasVisibleTo(viewerId, householdId)))
    .limit(1);
  const idea = rows[0];
  if (!idea) throw new NoPeekingError();
  return idea;
}

/** For creates: the target person must not be the viewer. */
export function assertNotSelf(viewerId: string, forPersonId: string): void {
  if (isSelf(viewerId, forPersonId)) throw new NoPeekingError();
}
