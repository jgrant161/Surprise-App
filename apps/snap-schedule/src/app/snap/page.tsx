import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SnapForm } from "./snap-form";
import { getFamily, getSnapsNeedingReview } from "@/db/queries";
import { hasApiKey } from "@/lib/claude";
import { DemoBadge } from "@/components/demo-badge";

export const metadata = { title: "Snap" };

export default async function SnapPage() {
  const family = await getFamily();
  const pending = await getSnapsNeedingReview(family.id);
  return (
    <>
      <PageHeader
        title="Snap a schedule"
        subtitle="Newsletter, team schedule, flyer or a group-chat screenshot."
        action={!hasApiKey() ? <DemoBadge /> : undefined}
      />
      <SnapForm />
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
