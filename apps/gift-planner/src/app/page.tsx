import Link from "next/link";
import { requireViewer } from "@/lib/viewer";
import { getHousehold } from "@/lib/household";
import { listPeople, listOccasions, listVisibleIdeas, listVisibleBudgets, pipelineFor, spentFor, personMap } from "@/lib/queries";
import { nextOccurrence, daysUntil, formatDate, countdownLabel } from "@/lib/dates";
import { formatCents } from "@/lib/money";
import { Shell } from "@/components/Shell";
import { Avatar } from "@/components/Avatar";
import { Empty } from "@/components/Empty";

export default async function Dashboard() {
  const viewer = await requireViewer();
  const household = await getHousehold();
  const [roster, occasions, visibleIdeas, visibleBudgets] = await Promise.all([
    listPeople(household.id),
    listOccasions(household.id),
    listVisibleIdeas(viewer.id, household.id),
    listVisibleBudgets(viewer.id, household.id),
  ]);
  const byId = personMap(roster);
  const year = new Date().getFullYear();

  const upcoming = occasions
    .map((o) => ({ o, next: nextOccurrence(o.date, o.yearly === 1) }))
    .filter((x): x is { o: typeof x.o; next: Date } => x.next !== null && daysUntil(x.next) <= 90)
    .sort((a, b) => a.next.getTime() - b.next.getTime());

  const needsIdeas = roster.filter((p) => p.id !== viewer.id && pipelineFor(visibleIdeas, p.id).total === 0);

  return (
    <Shell viewer={viewer} title="Surprise" action={<Link href="/capture" className="btn-primary btn-sm">+ Capture</Link>}>
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Coming up</h2>
        {upcoming.length === 0 ? (
          <Empty title="Nothing in the next 90 days" hint="Add occasions, or create birthdays from everyone's profile under Occasions." />
        ) : (
          <ul className="grid gap-3">
            {upcoming.map(({ o, next }) => {
              const covered = (o.forPersonId ? roster.filter((p) => p.id === o.forPersonId) : roster).filter((p) => p.id !== viewer.id);
              const days = daysUntil(next);
              return (
                <li key={o.id} className="card">
                  <div className="flex items-baseline justify-between gap-2">
                    <Link href={`/occasions/${o.id}`} className="text-lg font-bold hover:underline">{o.name}</Link>
                    <span className={`pill ${days <= 14 ? "bg-accent-soft text-accent" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"}`}>{countdownLabel(days)}</span>
                  </div>
                  <p className="text-sm text-muted">{formatDate(next)}</p>
                  {covered.length === 0 ? (
                    <p className="mt-3 rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">This one&apos;s about you. No peeking!</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-line">
                      {covered.map((p) => {
                        const pipe = pipelineFor(visibleIdeas, p.id, o.id);
                        const budget = visibleBudgets.find((b) => b.forPersonId === p.id && b.occasionId === o.id)?.amountCents ?? null;
                        const spent = spentFor(visibleIdeas, p.id, o.id, year);
                        const over = budget != null && spent > budget;
                        return (
                          <li key={p.id} className="flex items-center gap-3 py-2">
                            <Avatar name={p.name} color={p.color} size={32} />
                            <div className="min-w-0 flex-1">
                              <Link href={`/people/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
                              <p className="truncate text-xs text-muted">
                                {pipe.total === 0 ? (
                                  <span className="font-semibold text-accent">Needs ideas</span>
                                ) : (
                                  <>{pipe.idea} ideas · {pipe.planned} planned · {pipe.bought} bought · {pipe.wrapped} wrapped</>
                                )}
                              </p>
                            </div>
                            <div className="text-right text-xs">
                              <div className={over ? "font-semibold text-red-600" : "font-semibold"}>{formatCents(spent)}</div>
                              <div className="text-muted">{budget != null ? `of ${formatCents(budget)}` : "no budget"}</div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {needsIdeas.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Needs ideas</h2>
          <div className="card flex flex-wrap gap-2">
            {needsIdeas.map((p) => (
              <Link key={p.id} href={`/people/${p.id}`} className="btn-secondary btn-sm">
                <Avatar name={p.name} color={p.color} size={18} /> {p.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="card bg-accent-soft/60">
        <p className="font-semibold">Heard someone wish for something?</p>
        <p className="mt-1 text-sm text-muted">Jot it down now, before you forget. We&apos;ll sort out who it&apos;s for.</p>
        <Link href="/capture" className="btn-primary mt-3">Capture an idea</Link>
      </section>
      <p className="mt-6 text-center text-xs text-muted">{roster.length} people · {visibleIdeas.length} ideas you can see · {byId.get(viewer.id)?.name}&apos;s surprises hidden</p>
    </Shell>
  );
}
