import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const households = sqliteTable("households", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").notNull(),
});

export const people = sqliteTable("people", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull(),
  name: text("name").notNull(),
  /** 1 = uses the app (can log in), 0 = recipient only */
  isMember: integer("is_member").notNull().default(0),
  pin: text("pin"),
  /** 'YYYY-MM-DD' or 'MM-DD' */
  birthday: text("birthday"),
  interests: text("interests").notNull().default(""),
  sizes: text("sizes").notNull().default(""),
  notes: text("notes").notNull().default(""),
  color: text("color").notNull().default("#f59e0b"),
  createdAt: text("created_at").notNull(),
});

export const occasions = sqliteTable("occasions", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull(),
  name: text("name").notNull(),
  /** 'YYYY-MM-DD' */
  date: text("date").notNull(),
  yearly: integer("yearly").notNull().default(1),
  /** null = everyone (Christmas); set = one person's occasion (birthday) */
  forPersonId: text("for_person_id"),
  createdAt: text("created_at").notNull(),
});

export const IDEA_STATUSES = ["idea", "planned", "bought", "wrapped", "given"] as const;
export type IdeaStatus = (typeof IDEA_STATUSES)[number];

export const ideas = sqliteTable("ideas", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull(),
  forPersonId: text("for_person_id").notNull(),
  title: text("title").notNull(),
  url: text("url"),
  priceCents: integer("price_cents"),
  notes: text("notes").notNull().default(""),
  sourceQuote: text("source_quote"),
  status: text("status").$type<IdeaStatus>().notNull().default("idea"),
  claimedByPersonId: text("claimed_by_person_id"),
  occasionId: text("occasion_id"),
  addedByPersonId: text("added_by_person_id").notNull(),
  givenYear: integer("given_year"),
  clicks: integer("clicks").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const budgets = sqliteTable("budgets", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull(),
  forPersonId: text("for_person_id").notNull(),
  occasionId: text("occasion_id"),
  amountCents: integer("amount_cents").notNull(),
});

export type Household = typeof households.$inferSelect;
export type Person = typeof people.$inferSelect;
export type Occasion = typeof occasions.$inferSelect;
export type Idea = typeof ideas.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
