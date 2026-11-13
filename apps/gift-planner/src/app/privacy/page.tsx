import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE, SUPPORT_EMAIL } from "@/lib/legal";
import { Plain } from "@/components/Plain";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <Plain wide>
      <article className="mx-auto max-w-prose space-y-4 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-muted">Effective {LEGAL_EFFECTIVE_DATE}</p>

        <p>Surprise Stash is a shared gift list for a family or household, built so that nobody sees the gifts meant for them. This policy explains, in plain language, what we store and why.</p>

        <h2 className="text-lg font-semibold">What we collect</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>Your email address</strong>, used only to sign you in with a one-time code and to answer support requests.</li>
          <li><strong>Details you enter about the people you give gifts to</strong>: names, birthdays, interests, sizes, notes and a color. These are typically family members. You decide what to write down.</li>
          <li><strong>Gift ideas</strong>: titles, notes, links, optional prices, who suggested them, who is buying them, and their status.</li>
          <li><strong>Occasions and budgets</strong> you set up.</li>
          <li><strong>Notes you type into Capture</strong>, kept only long enough to turn them into ideas.</li>
          <li><strong>Basic technical data</strong> such as the browser type on your sessions, used to keep you signed in and to detect abuse.</li>
        </ul>

        <h2 className="text-lg font-semibold">How Capture works</h2>
        <p>
          When you use Capture, the note you typed and the first names and interests of the people in your household are sent to Anthropic&apos;s Claude API, which returns the gift ideas it found. Under Anthropic&apos;s commercial API terms, inputs sent this way are not used to train their models. Your email address is never sent.
        </p>

        <h2 className="text-lg font-semibold">Who can see what</h2>
        <p>Everyone who joins your household with its invite code can see the ideas, budgets and history for every person in it, <strong>except</strong> the ones meant for themself. That rule is enforced on our servers, not just hidden in the app. Share the invite code only with people you trust.</p>

        <h2 className="text-lg font-semibold">Shopping links</h2>
        <p>Links you add to an idea are opened through our site so we can count how often a link is used. Links to some retailers, including Amazon, may carry an affiliate tag; if you then buy something, the retailer may pay us a small commission at no cost to you. We never see what you buy.</p>

        <h2 className="text-lg font-semibold">What we don&apos;t do</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>No advertising, no ad tracking, no analytics SDKs from ad networks.</li>
          <li>We never sell or rent your data.</li>
          <li>We don&apos;t read your lists ourselves except to debug a problem you ask us about.</li>
        </ul>

        <h2 className="text-lg font-semibold">Service providers</h2>
        <p>We use a hosting provider for the app and database, Anthropic for Capture, an email provider for sending sign-in codes, and Apple&apos;s App Store, Google Play and RevenueCat for subscriptions. Each only receives what it needs to do its job.</p>

        <h2 className="text-lg font-semibold">Retention and deletion</h2>
        <p>Your lists stay until you delete them. Deleting your account from Settings removes your sign-in and your sessions and, if you were the only person who signs in to your household, the whole household including its people, occasions, ideas and budgets. Backups are cycled within 30 days.</p>

        <h2 className="text-lg font-semibold">Children</h2>
        <p>Surprise Stash is made for adults planning gifts. It is not directed at children under 13, and we do not knowingly collect personal information from them. Names of children you enter are stored only to label their gift lists.</p>

        <h2 className="text-lg font-semibold">Your rights</h2>
        <p>You can view and change your data in the app and delete everything from Settings. For anything else, email us and we will respond within 30 days.</p>

        <h2 className="text-lg font-semibold">Changes</h2>
        <p>If this policy changes in a meaningful way we will show a notice in the app before the change takes effect.</p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p><a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a></p>

        <p className="pt-4 text-xs text-muted"><Link href="/" className="underline">Home</Link> · <Link href="/terms" className="underline">Terms of Service</Link></p>
      </article>
    </Plain>
  );
}
