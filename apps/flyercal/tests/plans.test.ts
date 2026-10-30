import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateSnapAllowance, monthStartIso } from "../src/lib/plans";
import { planForEvent } from "../src/lib/revenuecat";

test("free plan allows snaps under the limit and blocks at the limit", () => {
  assert.deepEqual(evaluateSnapAllowance("free", 0, 5), { ok: true, used: 0, limit: 5, plan: "free" });
  assert.equal(evaluateSnapAllowance("free", 4, 5).ok, true);
  assert.equal(evaluateSnapAllowance("free", 5, 5).ok, false);
  assert.equal(evaluateSnapAllowance("free", 9, 5).ok, false);
});

test("pro plan is unlimited", () => {
  const r = evaluateSnapAllowance("pro", 999, 5);
  assert.equal(r.ok, true);
  assert.equal(r.limit, null);
});

test("month start is the first of the month in UTC", () => {
  assert.equal(monthStartIso(new Date("2026-10-30T15:00:00Z")), "2026-10-01T00:00:00.000Z");
});

test("RevenueCat event types map to plans", () => {
  for (const t of ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE"]) assert.equal(planForEvent({ type: t }), "pro");
  assert.equal(planForEvent({ type: "EXPIRATION" }), "free");
  assert.equal(planForEvent({ type: "CANCELLATION", expiration_at_ms: Date.now() + 1e6 }), null);
  assert.equal(planForEvent({ type: "CANCELLATION", expiration_at_ms: Date.now() - 1 }), "free");
  assert.equal(planForEvent({ type: "BILLING_ISSUE", expiration_at_ms: Date.now() - 1 }), "free");
  assert.equal(planForEvent({ type: "TEST" }), null);
  assert.equal(planForEvent({ type: "TRANSFER" }), null);
});
