import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SnapForm } from "./snap-form";
import { getSnapsNeedingReview } from "@/db/queries";
import { requireFamily } from "@/lib/auth";
import { canSnap } from "@/lib/plans";
import { hasApiKey } from "@/lib/claude";
import { DemoBadge } from "@/components/demo-badge";

export const metadata = { title: "Snap" };

export default async function SnapPage() {
  const { family } = await requireFamily();
  const [pending, allowance] = await Promise.all([getSnapsNeedingReview(family.id), canSnap(family)]);
  return (
    <>
      <PageHeader
        title="Snap a schedule"
        subtitle="Newsletter, team schedule, flyer or a group-chat screenshot."
        action={!hasApiKey() ? <DemoBadge /> : undefined}
      />
      {allowance.ok ? (
        <>
          <SnapForm />
          {allowance.limit !== null && (
            <p className="mt-2 text-center text-xs text-muted">
              {allowance.used} of {allowance.limit} free snaps used this month ·{" "}
              <Link href="/upgrade" className="underline">Go unlimited</Link>
            </p>
          )}
        </>
      ) : (
        <div className="card text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-2 text-lg font-semibold">You&apos;ve used all {allowance.limit} free snaps this month</h2>
          <p className="mt-1 text-sm text-muted">Pro gives you unlimited snaps, one calendar feed per kid, and priority support.</p>
          <Link href="/upgrade" className="btn-primary mt-4">See Pro</Link>
          <p className="mt-3 text-xs text-muted">Free snaps reset on the 1st.</p>
        </div>
      )}
      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-muted">Waiting for review</h2>
          <ul className="space-y-2">
            {pending.map((s) => (
              <li key={s.id}>
                <Link href={`/snaps/${s.id}/review`} className="card flex items-center justify-between text-sm hover:border-accent/50">
                  <span>
                    {s.kind === "image" ? "📷" : "📝"} {s.sourceLabel ?? (s.kind === "image" ? "Photo" : "Pasted text")}
                    {s.status === "failed" && <span className="ml-2 text-red-600">failed</span>}
                  </span>
                  <span className="text-muted">{new Date(s.createdAt).toLocaleDateString()}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
