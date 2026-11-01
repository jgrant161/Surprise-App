import Link from "next/link";
import { requireViewer } from "@/lib/viewer";
import { getHousehold } from "@/lib/household";
import { listPeople, listVisibleIdeas, personMap } from "@/lib/queries";
import { formatCents } from "@/lib/money";
import { Shell } from "@/components/Shell";
import { Avatar } from "@/components/Avatar";
import { Empty } from "@/components/Empty";
import type { Idea } from "@/db/schema";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const viewer = await requireViewer();
  const household = await getHousehold();
  const [roster, visible] = await Promise.all([listPeople(household.id), listVisibleIdeas(viewer.id, household.id)]);
  const byId = personMap(roster);
  const given = visible.filter((i) => i.status === "given");
  const years = new Map<number, Map<string, Idea[]>>();
  for (const g of given) {
    const y = g.givenYear ?? 0;
    const perPerson = years.get(y) ?? new Map<string, Idea[]>();
    perPerson.set(g.forPersonId, [...(perPerson.get(g.forPersonId) ?? []), g]);
    years.set(y, perPerson);
  }

  return (
    <Shell viewer={viewer} title="Gift history">
      <p className="mb-4 text-sm text-muted">Everything that&apos;s been given, so nobody gets the same thing twice.</p>
      {given.length === 0 ? (
        <Empty title="Nothing given yet" hint="Mark an idea as given and it shows up here." />
      ) : (
        <div className="grid gap-4">
          {[...years.entries()].sort((a, b) => b[0] - a[0]).map(([year, perPerson]) => (
            <section key={year}>
              <h2 className="mb-2 text-lg font-bold">{year || "Unknown year"}</h2>
              <div className="grid gap-2">
                {[...perPerson.entries()].map(([personId, items]) => {
                  const p = byId.get(personId);
                  return (
                    <div key={personId} className="card">
                      <Link href={`/people/${personId}`} className="flex items-center gap-2 font-semibold hover:underline">
                        {p && <Avatar name={p.name} color={p.color} size={24} />} {p?.name ?? "Someone"}
                      </Link>
                      <ul className="mt-2 divide-y divide-line text-sm">
                        {items.map((i) => (
                          <li key={i.id} className="flex justify-between gap-2 py-1.5">
                            <span>{i.title}{i.claimedByPersonId && <span className="text-muted"> · from {byId.get(i.claimedByPersonId)?.name}</span>}</span>
                            <span className="text-muted">{formatCents(i.priceCents)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </Shell>
  );
}
