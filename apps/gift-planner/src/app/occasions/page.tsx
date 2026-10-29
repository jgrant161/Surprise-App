import Link from "next/link";
import { requireViewer } from "@/lib/viewer";
import { getHousehold } from "@/lib/household";
import { listOccasions, listPeople, personMap } from "@/lib/queries";
import { nextOccurrence, daysUntil, formatDate, countdownLabel, parseISODate } from "@/lib/dates";
import { createOccasion, createBirthdayOccasions } from "@/app/actions";
import { Shell } from "@/components/Shell";

export const metadata = { title: "Occasions" };

export default async function OccasionsPage() {
  const viewer = await requireViewer();
  const household = await getHousehold();
  const [list, roster] = await Promise.all([listOccasions(household.id), listPeople(household.id)]);
  const byId = personMap(roster);
  const rows = list
    .map((o) => ({ o, next: nextOccurrence(o.date, o.yearly === 1) }))
    .sort((a, b) => (a.next?.getTime() ?? Infinity) - (b.next?.getTime() ?? Infinity));

  return (
    <Shell viewer={viewer} title="Occasions">
      <ul className="grid gap-2">
        {rows.map(({ o, next }) => (
          <li key={o.id}>
            <Link href={`/occasions/${o.id}`} className="card flex items-center justify-between gap-3 hover:border-accent">
              <div>
                <p className="font-semibold">{o.name}</p>
                <p className="text-xs text-muted">
                  {next ? formatDate(next) : `Past (${formatDate(parseISODate(o.date))})`}
                  {o.yearly === 1 && " · yearly"}
                  {o.forPersonId && ` · ${byId.get(o.forPersonId)?.name ?? "?"}`}
                </p>
              </div>
              {next && <span className="pill bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{countdownLabel(daysUntil(next))}</span>}
            </Link>
          </li>
        ))}
      </ul>

      <form action={createBirthdayOccasions} className="mt-4">
        <button className="btn-secondary w-full">Create birthday occasions for everyone</button>
        <p className="mt-1 text-center text-xs text-muted">Adds a yearly occasion for each person with a birthday who doesn&apos;t have one.</p>
      </form>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Add an occasion</h2>
        <form action={createOccasion} className="card grid gap-3">
          <input name="name" required className="input" placeholder="Christmas, Anniversary, Graduation…" />
          <div className="grid grid-cols-2 gap-3">
            <input name="date" type="date" required className="input" />
            <select name="forPersonId" className="input" defaultValue="">
              <option value="">Everyone</option>
              {roster.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="yearly" defaultChecked className="h-4 w-4" /> Repeats every year</label>
          <button className="btn-primary">Add occasion</button>
        </form>
      </section>
    </Shell>
  );
}
