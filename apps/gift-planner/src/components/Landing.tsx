import Link from "next/link";
import { FREE_RECIPIENTS } from "@/lib/plans";

/** What signed-out visitors see at "/". */
export function Landing() {
  return (
    <div className="mx-auto max-w-md py-8 text-center">
      <p className="text-5xl">🎁</p>
      <h1 className="mt-4 text-3xl font-black tracking-tight">Surprise Stash</h1>
      <p className="mt-3 text-lg text-muted">
        The family gift list that keeps the secret. Capture ideas all year, split who buys what, and nobody ever sees their own.
      </p>
      <ul className="mt-6 space-y-3 text-left text-sm">
        <li className="card flex gap-3"><span className="text-xl">✍️</span><span><strong>Capture it.</strong> &ldquo;Mom wants a garden kneeler&rdquo; becomes an idea on Mom&apos;s list in one tap.</span></li>
        <li className="card flex gap-3"><span className="text-xl">🙈</span><span><strong>No peeking.</strong> Everyone shares one household, and each person&apos;s own gifts are hidden from them. Always.</span></li>
        <li className="card flex gap-3"><span className="text-xl">🤝</span><span><strong>No doubles.</strong> &ldquo;I&apos;ve got this&rdquo; claims a gift, with budgets per occasion and a history so nobody repeats last year.</span></li>
      </ul>
      <Link href="/login" className="btn-primary mt-8 w-full text-base">Get started</Link>
      <p className="mt-3 text-xs text-muted">Free for up to {FREE_RECIPIENTS} people. No password, just your email.</p>
      <p className="mt-8 text-xs text-muted">
        <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link>
      </p>
    </div>
  );
}
