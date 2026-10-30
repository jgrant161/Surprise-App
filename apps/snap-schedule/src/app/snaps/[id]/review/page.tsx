import Link from "next/link";
import { notFound } from "next/navigation";
import { getMembers, getSnap, getSnapEvents } from "@/db/queries";
import { requireFamily } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { DemoBadge } from "@/components/demo-badge";
import { EventFields } from "@/components/event-fields";
import { addBlankDraft, confirmAll, deleteDraft, discardSnap, retrySnap } from "./actions";
import { ConfirmForm } from "./confirm-form";

export const metadata = { title: "Review" };

export default async function ReviewPage({ params }: PageProps<"/snaps/[id]/review">) {
  const { id } = await params;
  const { family } = await requireFamily();
  const snap = await getSnap(family.id, id);
  if (!snap || snap.status === "discarded") notFound();
  const [members, drafts] = await Promise.all([getMembers(family.id), getSnapEvents(family.id, id)]);
  const raw = snap.rawJson ? (JSON.parse(snap.rawJson) as { warnings?: string[] }) : null;
  const pending = drafts.filter((d) => d.status === "draft");

  if (snap.status === "confirmed") {
    return (
      <>
        <PageHeader title="Already confirmed" subtitle="These events are on the calendar." />
        <ul className="space-y-2">
          {drafts.map((d) => (
            <li key={d.id}>
              <Link href={`/events/${d.id}`} className="card block hover:border-accent/50">
                <span className="font-medium">{d.title}</span> <span className="text-sm text-muted">{d.startsAt.replace("T", " ")}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="btn-secondary mt-4 w-full">Back home</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Review events"
        subtitle={pending.length ? `${pending.length} found. Fix anything that looks off, then confirm.` : "No events found yet."}
        action={snap.demo ? <DemoBadge /> : undefined}
      />

      <details className="card mb-4" open={snap.kind === "text" && drafts.length === 0}>
        <summary className="cursor-pointer text-sm font-medium">
          {snap.kind === "image" ? "📷 Source photo" : "📝 Source text"} · {snap.sourceLabel}
        </summary>
        {snap.kind === "image" ? (
          snap.imageDeletedAt ? (
            <p className="mt-3 text-sm text-muted">The photo was deleted after processing. Only the extracted events are kept.</p>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/snaps/${snap.id}/image`} alt="Snapped schedule" className="mt-3 max-h-96 w-full rounded-lg object-contain bg-black/5" />
          )
        ) : (
          <pre className="mt-3 whitespace-pre-wrap text-sm text-muted">{snap.text}</pre>
        )}
      </details>

      {snap.status === "failed" && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100">
          <p className="font-semibold">Couldn&apos;t read this one.</p>
          <p className="mt-1">{snap.errorMessage}</p>
          <div className="mt-3 flex gap-2">
            <form action={retrySnap.bind(null, snap.id)}><button className="btn-primary">Try again</button></form>
            <form action={discardSnap.bind(null, snap.id)}><button className="btn-secondary">Discard</button></form>
          </div>
        </div>
      )}

      {snap.status === "processing" && (
        <div className="card mb-4 text-sm text-muted">Still processing… refresh in a moment.</div>
      )}

      {raw?.warnings?.length ? (
        <ul className="mb-4 space-y-1 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          {raw.warnings.map((w, i) => (
            <li key={i}>⚠️ {w}</li>
          ))}
        </ul>
      ) : null}

      {snap.status !== "failed" && (
        <ConfirmForm action={confirmAll.bind(null, snap.id)} count={pending.length}>
          {pending.map((d, i) => (
            <section key={d.id} className={`card ${d.confidence === "low" ? "border-amber-400" : ""}`}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted">Event {i + 1}{d.confidence && d.confidence !== "high" ? ` · ${d.confidence} confidence` : ""}</h2>
                <button formAction={deleteDraft.bind(null, snap.id, d.id)} className="btn-danger -mr-2 py-1 text-xs">Remove</button>
              </div>
              <EventFields event={d} members={members} prefix={`${d.id}:`} />
              {d.sourceText && (
                <p className="mt-3 rounded-lg bg-border/40 px-3 py-2 text-xs text-muted">
                  <span className="font-medium">From the source:</span> “{d.sourceText}”
                </p>
              )}
            </section>
          ))}
          <div className="flex gap-2">
            <button formAction={addBlankDraft.bind(null, snap.id)} className="btn-secondary flex-1">+ Add an event</button>
            <button formAction={discardSnap.bind(null, snap.id)} className="btn-danger">Discard all</button>
          </div>
        </ConfirmForm>
      )}
    </>
  );
}
