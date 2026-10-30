import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <article className="prose-sm mx-auto max-w-prose space-y-4 py-4 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">Privacy Policy</h1>
      <p className="text-muted">Effective {LEGAL_EFFECTIVE_DATE}</p>

      <p>FlyerCal turns photos and text of schedules into calendar events for your family. This policy explains, in plain language, what we store and why.</p>

      <h2 className="text-lg font-semibold">What we collect</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li><strong>Your email address</strong>, used only to sign you in with a one-time code and to answer support requests.</li>
        <li><strong>Family details you enter</strong>: the family name, member names and colors, and your time zone.</li>
        <li><strong>Photos and text you snap</strong>. An uploaded image is kept only until you confirm or discard the events found in it, and never longer than 7 days. After that only the extracted events remain.</li>
        <li><strong>Extracted events</strong>: title, date, time, location, notes, who is going and who drives.</li>
        <li><strong>Basic technical data</strong> such as the browser type on your sessions, used to keep you signed in and to detect abuse.</li>
      </ul>

      <h2 className="text-lg font-semibold">How snaps are processed</h2>
      <p>
        To read a schedule, the photo or text is sent to Anthropic&apos;s Claude API, which returns the list of events. Under Anthropic&apos;s commercial API terms, inputs sent this way are not used to train their models. We do not send your email or family member emails with the snap; only the image or text, today&apos;s date, your time zone, and the first names you gave your family members so events can be matched to them.
      </p>

      <h2 className="text-lg font-semibold">Calendar feeds</h2>
      <p>Your family calendar is available at a private link containing a long random token. Anyone with the link can read your events, so share it only with family. You can reset the link at any time from the Subscribe page.</p>

      <h2 className="text-lg font-semibold">What we don&apos;t do</h2>
      <ul className="list-disc space-y-1 pl-5">
        <li>No advertising, no ad tracking, no analytics SDKs from ad networks.</li>
        <li>We never sell or rent your data.</li>
        <li>We don&apos;t read your snaps ourselves except to debug a problem you ask us about.</li>
      </ul>

      <h2 className="text-lg font-semibold">Service providers</h2>
      <p>We use a hosting provider for the app and database, Anthropic for reading schedules, an email provider for sending sign-in codes, and Apple&apos;s App Store, Google Play and RevenueCat for subscriptions. Each only receives what it needs to do its job.</p>

      <h2 className="text-lg font-semibold">Retention and deletion</h2>
      <p>Images are deleted when you confirm or discard a snap and in any case within 7 days. Events stay until you delete them. Deleting your account from Settings removes your sign-in, your sessions and, if you were the only grown-up in your family, the whole family including its members, snaps and events. Backups are cycled within 30 days.</p>

      <h2 className="text-lg font-semibold">Children</h2>
      <p>FlyerCal is made for parents and caregivers. It is not directed at children under 13, and we do not knowingly collect personal information from them. Family member names you enter are stored only to label events.</p>

      <h2 className="text-lg font-semibold">Your rights</h2>
      <p>You can view and change your data in the app, export events as .ics files, and delete everything from Settings. For anything else, email us and we will respond within 30 days.</p>

      <h2 className="text-lg font-semibold">Changes</h2>
      <p>If this policy changes in a meaningful way we will show a notice in the app before the change takes effect.</p>

      <h2 className="text-lg font-semibold">Contact</h2>
      <p><a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a></p>

      <p className="pt-4 text-xs text-muted"><Link href="/" className="underline">Home</Link> · <Link href="/terms" className="underline">Terms of Service</Link></p>
    </article>
  );
}
