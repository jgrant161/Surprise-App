import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { FREE_SNAPS_PER_MONTH, PRO_PRICE_MONTHLY, PRO_PRICE_YEARLY } from "@/lib/plans";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Go Pro" };

/**
 * Purchase buttons are intentionally inert on the web. The native shell (apps/flyercal-native)
 * intercepts clicks on [data-product] and starts the matching RevenueCat purchase; RevenueCat's
 * webhook (/api/webhooks/revenuecat) then flips the family's plan.
 */
export default async function UpgradePage() {
  const { family } = await requireUser();
  const isPro = family?.plan === "pro";
  return (
    <>
      <PageHeader title="FlyerCal Pro" subtitle={isPro ? "You're on Pro. Thank you!" : `Free gives you ${FREE_SNAPS_PER_MONTH} snaps a month. Pro removes the limit.`} />
      <ul className="card mb-4 space-y-2 text-sm">
        <li>✅ <strong>Unlimited snaps</strong>: every newsletter, every season.</li>
        <li>✅ <strong>A calendar feed per family member</strong>, so each kid&apos;s events can live on their own calendar.</li>
        <li>✅ <strong>Priority support</strong> from a real human.</li>
      </ul>
      {!isPro && (
        <div className="grid grid-cols-2 gap-3">
          <button type="button" data-product="pro_monthly" className="card text-left hover:border-accent">
            <p className="text-xs uppercase tracking-wide text-muted">Monthly</p>
            <p className="mt-1 text-2xl font-semibold">{PRO_PRICE_MONTHLY}</p>
            <p className="text-xs text-muted">per month</p>
          </button>
          <button type="button" data-product="pro_yearly" className="card border-accent text-left">
            <p className="text-xs uppercase tracking-wide text-accent">Yearly · 2 months free</p>
            <p className="mt-1 text-2xl font-semibold">{PRO_PRICE_YEARLY}</p>
            <p className="text-xs text-muted">per year</p>
          </button>
        </div>
      )}
      {!isPro && (
        <p className="mt-4 text-center text-sm text-muted" data-web-only>
          Subscriptions are coming to the web soon. Install the app to subscribe.
        </p>
      )}
      <p className="mt-6 text-center text-xs text-muted">
        Payment is charged to your App Store or Google Play account. Cancel any time in your store subscription settings.{" "}
        <Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link>
      </p>
    </>
  );
}
