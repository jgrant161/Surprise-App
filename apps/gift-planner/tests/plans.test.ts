import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluateAllowance, monthStartIso } from "../src/lib/plans";
import { planForEvent } from "../src/lib/revenuecat";

test("free plan allows under the limit and blocks at the limit", () => {
  assert.deepEqual(evaluateAllowance("free", 0, 4), { ok: true, used: 0, limit: 4, plan: "free" });
  assert.equal(evaluateAllowance("free", 3, 4).ok, true);
  assert.equal(evaluateAllowance("free", 4, 4).ok, false);
  assert.equal(evaluateAllowance("free", 9, 4).ok, false);
});

test("pro plan is unlimited", () => {
  const r = evaluateAllowance("pro", 999, 4);
  assert.equal(r.ok, true);
  assert.equal(r.limit, null);
});

test("month start is the first of the month in UTC", () => {
  assert.equal(monthStartIso(new Date("2026-11-13T15:00:00Z")), "2026-11-01T00:00:00.000Z");
});

test("RevenueCat event types map to plans", () => {
  for (const t of ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE"]) assert.equal(planForEvent({ type: t }), "pro");
  assert.equal(planForEvent({ type: "EXPIRATION" }), "free");
  assert.equal(planForEvent({ type: "CANCELLATION", expiration_at_ms: Date.now() + 1e6 }), null);
  assert.equal(planForEvent({ type: "CANCELLATION", expiration_at_ms: Date.now() - 1 }), "free");
  assert.equal(planForEvent({ type: "BILLING_ISSUE", expiration_at_ms: Date.now() - 1 }), "free");
  assert.equal(planForEvent({ type: "TEST" }), null);
});
