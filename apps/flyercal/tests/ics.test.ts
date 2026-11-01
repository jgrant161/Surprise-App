import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCalendar, eventEnd, toIcsLocal } from "../src/lib/ics";

test("escapes commas, semicolons, backslashes and newlines", () => {
  const out = buildCalendar("Fam", [
    { uid: "1", title: "A, B; C\\D", startsAt: "2026-11-03T17:30", endsAt: null, allDay: false, description: "line1\nline2", updatedAt: "2026-10-30T00:00:00Z" },
  ]);
  assert.match(out, /SUMMARY:A\\, B\; C\\\\D/);
  assert.match(out, /DESCRIPTION:line1\\nline2/);
});

test("all-day events use VALUE=DATE and end on the next day", () => {
  const out = buildCalendar("Fam", [
    { uid: "1", title: "Picture Day", startsAt: "2026-11-06", endsAt: null, allDay: true, updatedAt: "2026-10-30T00:00:00Z" },
  ]);
  assert.match(out, /DTSTART;VALUE=DATE:20261106\r\n/);
  assert.match(out, /DTEND;VALUE=DATE:20261107\r\n/);
});

test("timed events default to 60 minutes and use floating local time", () => {
  assert.equal(eventEnd({ startsAt: "2026-11-03T17:30", endsAt: null, allDay: false }), "2026-11-03T18:30");
  assert.equal(eventEnd({ startsAt: "2026-11-03T23:30", endsAt: null, allDay: false }), "2026-11-04T00:30");
  assert.equal(toIcsLocal("2026-11-03T17:30"), "20261103T173000");
});

test("long lines are folded at 73 chars with a leading space and CRLF everywhere", () => {
  const long = "x".repeat(200);
  const out = buildCalendar("Fam", [{ uid: "1", title: long, startsAt: "2026-11-03", endsAt: null, allDay: true, updatedAt: "2026-10-30T00:00:00Z" }]);
  for (const line of out.split("\r\n")) assert.ok(line.length <= 73, `line too long: ${line.length}`);
  assert.ok(!/[^\r]\n/.test(out), "bare LF found");
  assert.match(out, /\r\n x+/);
});
