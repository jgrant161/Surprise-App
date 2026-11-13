import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

/* ---------- accounts ---------- */

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: text("created_at").notNull(),
  lastLoginAt: text("last_login_at"),
});

export const loginCodes = sqliteTable("login_codes", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  codeHash: text("code_hash").notNull(),
  expiresAt: text("expires_at").notNull(),
  attempts: integer("attempts").notNull().default(0),
  consumedAt: text("consumed_at"),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  userAgent: text("user_agent"),
});

/* ---------- households ---------- */

export const households = sqliteTable("households", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  plan: text("plan", { enum: ["free", "pro"] }).notNull().default("free"),
  planSource: text("plan_source"),
  planUpdatedAt: text("plan_updated_at"),
  createdAt: text("created_at").notNull(),
});

/** A signed-in user's seat in a household, tied to the `people` row that is "them". */
export const householdUsers = sqliteTable(
  "household_users",
  {
    householdId: text("household_id").notNull().references(() => households.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    personId: text("person_id").notNull(),
    role: text("role", { enum: ["owner", "member"] }).notNull().default("member"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.householdId, t.userId] })],
);

/** Tiny key/value table for housekeeping state. */
export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const people = sqliteTable("people", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull(),
  name: text("name").notNull(),
  /** 1 = a signed-in user is linked to this person (see household_users), 0 = recipient only */
  isMember: integer("is_member").notNull().default(0),
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

/** One row per AI capture, for free-tier metering. */
export const captures = sqliteTable("captures", {
  id: text("id").primaryKey(),
  householdId: text("household_id").notNull(),
  ideaCount: integer("idea_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Household = typeof households.$inferSelect;
export type HouseholdUser = typeof householdUsers.$inferSelect;
export type Person = typeof people.$inferSelect;
export type Occasion = typeof occasions.$inferSelect;
export type Idea = typeof ideas.$inferSelect;
export type Budget = typeof budgets.$inferSelect;
