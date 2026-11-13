/**
 * RevenueCat webhook event types -> plan.
 * https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields
 */
export type Plan = "free" | "pro";

const GRANTS = new Set(["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"]);
const REVOKES = new Set(["EXPIRATION"]);

export type RevenueCatEvent = {
  type?: string;
  app_user_id?: string;
  expiration_at_ms?: number | null;
};

/**
 * Returns the plan to set, or null when the event does not change entitlement.
 * CANCELLATION only means auto-renew was turned off; access continues until EXPIRATION,
 * unless the event already carries a past expiration. BILLING_ISSUE likewise.
 */
export function planForEvent(event: RevenueCatEvent, now = Date.now()): Plan | null {
  const type = (event.type ?? "").toUpperCase();
  if (GRANTS.has(type)) return "pro";
  if (REVOKES.has(type)) return "free";
  if (type === "CANCELLATION" || type === "BILLING_ISSUE") {
    const exp = event.expiration_at_ms;
    if (typeof exp === "number" && exp <= now) return "free";
    return null;
  }
  return null;
}
