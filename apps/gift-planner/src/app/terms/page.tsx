import Link from "next/link";
import { LEGAL_EFFECTIVE_DATE, SUPPORT_EMAIL } from "@/lib/legal";
import { Plain } from "@/components/Plain";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <Plain wide>
      <article className="mx-auto max-w-prose space-y-4 text-sm leading-relaxed">
        <h1 className="text-2xl font-bold tracking-tight">Terms of Service</h1>
        <p className="text-muted">Effective {LEGAL_EFFECTIVE_DATE}</p>

        <p>These terms are a short agreement between you and the maker of Surprise Stash (&quot;we&quot;). By creating an account you accept them.</p>

        <h2 className="text-lg font-semibold">The service</h2>
        <p>Surprise Stash keeps a shared gift list for your household and hides each person&apos;s own gifts from them. The Capture feature uses automated AI to turn notes into ideas and can make mistakes: wrong person, wrong price, invented detail. <strong>Review what it suggests before you rely on it.</strong> We can&apos;t guarantee a surprise stays a surprise if someone in your household shares their screen or their invite code.</p>

        <h2 className="text-lg font-semibold">Your account</h2>
        <p>You sign in with your email and a one-time code. Keep your email account secure; anyone who can read your email can sign in as you. You must be at least 18 to create an account. You are responsible for anyone you invite into your household.</p>

        <h2 className="text-lg font-semibold">Acceptable use</h2>
        <p>Only enter information about other people that you have a legitimate family or personal reason to keep. Don&apos;t use the service to send abuse, or to probe or overload our systems. We may suspend accounts that do.</p>

        <h2 className="text-lg font-semibold">Plans and payment</h2>
        <p>The free plan includes a limited number of people and a limited number of AI captures per calendar month. Pro is a recurring subscription bought through the Apple App Store or Google Play and billed by them under their terms. It renews automatically until you cancel in your store&apos;s subscription settings; cancellation takes effect at the end of the current period. Refunds are handled by the store.</p>

        <h2 className="text-lg font-semibold">Shopping links</h2>
        <p>Some outbound links carry an affiliate tag. Purchases are made with the retailer under the retailer&apos;s terms; we are not a party to them.</p>

        <h2 className="text-lg font-semibold">Your content</h2>
        <p>Your lists belong to you and your household. You give us permission to store and process them only to provide the service, including sending Capture notes to our AI provider as described in the <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>

        <h2 className="text-lg font-semibold">Ending things</h2>
        <p>You can delete your account at any time from Settings. We may end or change the service with reasonable notice; if we shut down we will give you time to copy your lists.</p>

        <h2 className="text-lg font-semibold">No warranty, limited liability</h2>
        <p>The service is provided &quot;as is&quot;. To the extent the law allows, we are not liable for indirect or consequential losses, and our total liability is limited to what you paid us in the past 12 months.</p>

        <h2 className="text-lg font-semibold">Contact</h2>
        <p><a href={`mailto:${SUPPORT_EMAIL}`} className="underline">{SUPPORT_EMAIL}</a></p>

        <p className="pt-4 text-xs text-muted"><Link href="/" className="underline">Home</Link> · <Link href="/privacy" className="underline">Privacy Policy</Link></p>
      </article>
    </Plain>
  );
}
