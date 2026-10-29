import Link from "next/link";
import { notFound } from "next/navigation";
import { requireViewer } from "@/lib/viewer";
import { getHousehold } from "@/lib/household";
import { getOccasion, listPeople, listVisibleIdeas, listVisibleBudgets, pipelineFor, spentFor, personMap } from "@/lib/queries";
import { nextOccurrence, daysUntil, formatDate, countdownLabel } from "@/lib/dates";
import { formatCents, centsToDollarInput } from "@/lib/money";
import { updateOccasion, deleteOccasion, setBudget } from "@/app/actions";
import { Shell } from "@/components/Shell";
import { Avatar } from "@/components/Avatar";
import { StatusPill } from "@/components/StatusPill";

export default async function OccasionPage({ params }: PageProps<"/occasions/[id]">) {
  const { id } = await params;
  const viewer = await requireViewer();
  const household = await getHousehold();
  const occasion = await getOccasion(household.id, id);
  if (!occasion) notFound();
  const [roster, visibleIdeas, visibleBudgets] = await Promise.all([
    listPeople(household.id),
    listVisibleIdeas(viewer.id, household.id),
    listVisibleBudgets(viewer.id, household.id),
  ]);
  const byId = personMap(roster);
  const next = nextOccurrence(occasion.date, occasion.yearly === 1);
  const year = new Date().getFullYear();
  const covered = (occasion.forPersonId ? roster.filter((p) => p.id === occasion.forPersonId) : roster).filter((p) => p.id !== viewer.id);
  const totals = covered.reduce(
    (acc, p) => {
      acc.budget += visibleBudgets.find((b) => b.forPersonId === p.id && b.occasionId === occasion.id)?.amountCents ?? 0;
      acc.spent += spentFor(visibleIdeas, p.id, occasion.id, year);
      return acc;
    },
    { budget: 0, spent: 0 },
  );

  return (
    <Shell viewer={viewer} title={occasion.name}>
      <section className="card">
        <div className="flex items-baseline justify-between">
          <p className="text-muted">{next ? formatDate(next) : "Past"}{occasion.yearly === 1 && " · yearly"}</p>
          {next && <span className="pill bg-accent-soft text-accent">{countdownLabel(daysUntil(next))}</span>}
        </div>
        <p className="mt-2 text-2xl font-black">{formatCents(totals.spent)} <span className="text-base font-medium text-muted">of {formatCents(totals.budget)} budgeted</span></p>
      </section>

      {covered.length === 0 ? (
        <p className="card mt-4 text-center text-accent">This occasion is about you. No peeking!</p>
      ) : (
        <section className="mt-4 grid gap-3">
          {covered.map((p) => {
            const pipe = pipelineFor(visibleIdeas, p.id, occasion.id);
            const budget = visibleBudgets.find((b) => b.forPersonId === p.id && b.occasionId === occasion.id)?.amountCents ?? null;
            const spent = spentFor(visibleIdeas, p.id, occasion.id, year);
            const list = visibleIdeas.filter((i) => i.forPersonId === p.id && i.status !== "given" && (!i.occasionId || i.occasionId === occasion.id));
            return (
              <div key={p.id} className="card">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} color={p.color} size={36} />
                  <div className="flex-1">
                    <Link href={`/people/${p.id}`} className="font-semibold hover:underline">{p.name}</Link>
                    <p className="text-xs text-muted">{pipe.total} ideas · {pipe.bought + pipe.wrapped} ready</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className={budget != null && spent > budget ? "font-bold text-red-600" : "font-bold"}>{formatCents(spent)}</div>
                    <form action={setBudget} className="flex items-center gap-1">
                      <input type="hidden" name="forPersonId" value={p.id} />
                      <input type="hidden" name="occasionId" value={occasion.id} />
                      <span className="text-xs text-muted">of $</span>
                      <input name="amount" defaultValue={centsToDollarInput(budget)} inputMode="decimal" className="input w-20 px-2 py-1 text-right text-xs" placeholder="budget" />
                      <button className="btn-ghost btn-sm">Set</button>
                    </form>
                  </div>
                </div>
                {list.length > 0 && (
                  <ul className="mt-3 divide-y divide-line text-sm">
                    {list.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-2 py-1.5">
                        <span className="truncate">{i.title}{i.claimedByPersonId && <span className="text-muted"> · {byId.get(i.claimedByPersonId)?.name}</span>}</span>
                        <span className="flex shrink-0 items-center gap-2"><StatusPill status={i.status} /><span className="text-muted">{formatCents(i.priceCents)}</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </section>
      )}

      <details className="card mt-6">
        <summary className="cursor-pointer text-sm font-semibold">Edit occasion</summary>
        <form action={updateOccasion} className="mt-3 grid gap-3">
          <input type="hidden" name="id" value={occasion.id} />
          <input name="name" defaultValue={occasion.name} required className="input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="date" type="date" defaultValue={occasion.date} required className="input" />
            <select name="forPersonId" defaultValue={occasion.forPersonId ?? ""} className="input">
              <option value="">Everyone</option>
              {roster.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="yearly" defaultChecked={occasion.yearly === 1} className="h-4 w-4" /> Repeats every year</label>
          <button className="btn-primary">Save</button>
        </form>
        <form action={deleteOccasion} className="mt-3 border-t border-line pt-3">
          <input type="hidden" name="id" value={occasion.id} />
          <button className="btn-ghost btn-sm text-red-600">Delete occasion</button>
        </form>
      </details>
    </Shell>
  );
}
