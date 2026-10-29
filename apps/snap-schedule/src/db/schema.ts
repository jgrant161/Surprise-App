import { sqliteTable, text, integer, blob, primaryKey } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const families = sqliteTable("families", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull().default("America/New_York"),
  createdAt: text("created_at").notNull(),
});

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(),
  role: text("role", { enum: ["adult", "kid"] }).notNull().default("kid"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const snaps = sqliteTable("snaps", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["image", "text"] }).notNull(),
  imageMime: text("image_mime"),
  image: blob("image", { mode: "buffer" }),
  text: text("text"),
  sourceLabel: text("source_label"),
  status: text("status", { enum: ["processing", "needs_review", "confirmed", "failed"] })
    .notNull()
    .default("processing"),
  errorMessage: text("error_message"),
  rawJson: text("raw_json"),
  demo: integer("demo", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  familyId: text("family_id").notNull().references(() => families.id, { onDelete: "cascade" }),
  snapId: text("snap_id").references(() => snaps.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  /** Local wall-clock time without offset, e.g. "2026-11-03T17:30" (or "2026-11-03" for all-day). */
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at"),
  allDay: integer("all_day", { mode: "boolean" }).notNull().default(false),
  location: text("location"),
  notes: text("notes"),
  bring: text("bring"),
  driverMemberId: text("driver_member_id").references(() => members.id, { onDelete: "set null" }),
  status: text("status", { enum: ["draft", "confirmed"] }).notNull().default("draft"),
  confidence: text("confidence", { enum: ["high", "medium", "low"] }),
  sourceText: text("source_text"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const eventMembers = sqliteTable(
  "event_members",
  {
    eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
    memberId: text("member_id").notNull().references(() => members.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.memberId] })],
);

export const familiesRelations = relations(families, ({ many }) => ({
  members: many(members),
  events: many(events),
  snaps: many(snaps),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  family: one(families, { fields: [members.familyId], references: [families.id] }),
  eventMembers: many(eventMembers),
}));

export const snapsRelations = relations(snaps, ({ one, many }) => ({
  family: one(families, { fields: [snaps.familyId], references: [families.id] }),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  family: one(families, { fields: [events.familyId], references: [families.id] }),
  snap: one(snaps, { fields: [events.snapId], references: [snaps.id] }),
  driver: one(members, { fields: [events.driverMemberId], references: [members.id] }),
  eventMembers: many(eventMembers),
}));

export const eventMembersRelations = relations(eventMembers, ({ one }) => ({
  event: one(events, { fields: [eventMembers.eventId], references: [events.id] }),
  member: one(members, { fields: [eventMembers.memberId], references: [members.id] }),
}));

export type Family = typeof families.$inferSelect;
export type Member = typeof members.$inferSelect;
export type Snap = typeof snaps.$inferSelect;
export type Event = typeof events.$inferSelect;
