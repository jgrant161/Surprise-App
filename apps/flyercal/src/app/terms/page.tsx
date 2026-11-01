import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE, SUPPORT_EMAIL } from "@/lib/legal";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-prose space-y-4 py-4 text-sm leading-relaxed">
      <h1 className="text-2xl font-semibold tracking-tight">Terms of Service</h1>
      <p className="text-muted">Effective {LEGAL_EFFECTIVE_DATE}</p>

      <p>These terms are a short agreement between you and the maker of FlyerCal (&quot;we&quot;). By creating an account you accept them.</p>

      <h2 className="text-lg font-semibold">The service</h2>
      <p>FlyerCal reads schedules you upload and turns them into calendar events. Extraction is automated and can make mistakes: wrong dates, missed items, or invented details. <strong>Always review events before relying on them.</strong> We are not responsible for a missed practice, picture day or meeting.</p>

      <h2 className="text-lg font-semibold">Your account</h2>
      <p>You sign in with your email and a one-time code. Keep your email account secure; anyone who can read your email can sign in as you. You must be at least 18 to create an account. You are responsible for anyone you invite into your family.</p>

      <h2 className="text-lg font-semibold">Acceptable use</h2>
      <p>Only upload material you have the right to share. Don&apos;t use the service to process other people&apos;s private information without permission, to send abuse, or to probe or overload our systems. We may suspend accounts that do.</p>

      <h2 className="text-lg font-semibold">Plans and payment</h2>
      <p>The free plan includes a limited number of snaps per calendar month. Pro is a recurring subscription bought through the Apple App Store or Google Play and billed by them under their terms. It renews automatically until you cancel in your store&apos;s subscription settings; cancellation takes effect at the end of the current period. Refunds are handled by the store.</p>

      <h2 className="text-lg font-semibold">Your content</h2>
      <p>Your snaps and events belong to you. You give us permission to store and process them only to provide the service, including sending snaps to our AI provider for extraction as described in the <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>

      <h2 className="text-lg font-semibold">Ending things</h2>
      <p>You can delete your account at any time from Settings. We may end or change the service with reasonable notice; if we shut down we will give you time to export your events.</p>

      <h2 className="text-lg font-semibold">No warranty, limited liability</h2>
      <p>The service is provided &quot;as is&quot;. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability is limited to what you paid us in the past 12 months.</p>

      <h2 className="text-lg font-semibold">Contact</h2>
      <p><a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a></p>

      <p className="pt-4 text-xs text-muted"><Link href="/" className="underline">Home</Link> · <Link href="/privacy" className="underline">Privacy Policy</Link></p>
    </article>
  );
}
