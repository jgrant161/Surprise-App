import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { FREE_CAPTURES_PER_MONTH, FREE_RECIPIENTS, PRO_PRICE_MONTHLY, PRO_PRICE_YEARLY } from "@/lib/plans";
import { Shell } from "@/components/Shell";
import { Plain } from "@/components/Plain";

export const metadata = { title: "Go Pro" };

/**
 * Purchase buttons are intentionally inert on the web. The native shell intercepts clicks on
 * [data-product] and starts the matching RevenueCat purchase; RevenueCat's webhook
 * (/api/webhooks/revenuecat) then flips the household's plan. app_user_id = data-household-id.
 */
export default async function UpgradePage({ searchParams }: PageProps<"/upgrade">) {
  const sp = await searchParams;
  const { household, person } = await requireUser();
  const isPro = household?.plan === "pro";
  const reason = typeof sp.reason === "string" ? sp.reason : null;

  const body = (
    <div data-household-id={household?.id ?? ""}>
      <h2 className="text-2xl font-black tracking-tight">Surprise Stash Pro</h2>
      <p className="mt-1 text-sm text-muted">
        {isPro ? "You're on Pro. Thank you!" : `Free covers ${FREE_RECIPIENTS} people and ${FREE_CAPTURES_PER_MONTH} AI captures a month. Pro removes both limits.`}
      </p>
      {reason === "people" && !isPro && (
        <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">Your household already has {FREE_RECIPIENTS} people on the free plan. Pro lets you add everyone.</p>
      )}
      <ul className="card my-4 space-y-2 text-sm">
        <li>✅ <strong>Unlimited people</strong>: grandparents, cousins, teachers, the whole list.</li>
        <li>✅ <strong>Unlimited captures</strong>: jot down every hint, all year.</li>
        <li>✅ <strong>Budgets per occasion</strong>, with spent-so-far for each person.</li>
        <li>✅ <strong>Gift history across years</strong>, so nobody gets the same thing twice.</li>
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
    </div>
  );

  return person ? <Shell viewer={person} title="Go Pro">{body}</Shell> : <Plain>{body}</Plain>;
}
