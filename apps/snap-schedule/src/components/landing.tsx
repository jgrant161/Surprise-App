import Link from "next/link";

/** What anonymous visitors see at "/". */
export function Landing() {
  return (
    <div className="mx-auto max-w-md py-8 text-center">
      <p className="text-5xl">📸</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Snap Schedule</h1>
      <p className="mt-3 text-lg text-muted">
        Photograph a school newsletter or team schedule and every date lands on the family calendar.
      </p>
      <ul className="mt-6 space-y-3 text-left text-sm">
        <li className="card flex gap-3"><span className="text-xl">📷</span><span><strong>Snap it.</strong> Flyers, newsletters, team schedules, group-chat screenshots or pasted text.</span></li>
        <li className="card flex gap-3"><span className="text-xl">✅</span><span><strong>Review it.</strong> Fix anything, tag which kid it&apos;s for, who drives, and what to bring.</span></li>
        <li className="card flex gap-3"><span className="text-xl">📅</span><span><strong>It syncs.</strong> One subscribe link per family member works with Apple and Google calendars.</span></li>
      </ul>
      <Link href="/login" className="btn-primary mt-8 w-full text-base">Get started</Link>
      <p className="mt-3 text-xs text-muted">Free for 5 snaps a month. No password, just your email.</p>
      <p className="mt-8 text-xs text-muted">
        <Link href="/privacy" className="underline">Privacy</Link> · <Link href="/terms" className="underline">Terms</Link>
      </p>
    </div>
  );
}
