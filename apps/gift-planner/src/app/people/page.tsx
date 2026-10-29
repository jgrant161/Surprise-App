import Link from "next/link";
import { requireViewer } from "@/lib/viewer";
import { getHousehold } from "@/lib/household";
import { listPeople, listVisibleIdeas, pipelineFor } from "@/lib/queries";
import { nextOccurrence, daysUntil, formatBirthday } from "@/lib/dates";
import { Shell } from "@/components/Shell";
import { Avatar } from "@/components/Avatar";

export const metadata = { title: "People" };

export default async function PeoplePage({ searchParams }: PageProps<"/people">) {
  const sp = await searchParams;
  const viewer = await requireViewer();
  const household = await getHousehold();
  const [roster, visible] = await Promise.all([listPeople(household.id), listVisibleIdeas(viewer.id, household.id)]);
  const saved = typeof sp.saved === "string" ? Number(sp.saved) : null;

  return (
    <Shell viewer={viewer} title="People" action={<Link href="/people/new" className="btn-primary btn-sm">+ Add</Link>}>
      {saved != null && (
        <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100">
          Saved {saved} idea{saved === 1 ? "" : "s"}.
        </p>
      )}
      <ul className="grid gap-3">
        {roster.map((p) => {
          const self = p.id === viewer.id;
          const pipe = pipelineFor(visible, p.id);
          const next = p.birthday ? nextOccurrence(p.birthday, true) : null;
          return (
            <li key={p.id}>
              <Link href={`/people/${p.id}`} className="card flex items-center gap-3 hover:border-accent">
                <Avatar name={p.name} color={p.color} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {p.name} {self && <span className="pill bg-accent-soft text-accent">you</span>}
                    {p.isMember === 1 && !self && <span className="ml-1 pill bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">member</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {p.birthday ? `Birthday ${formatBirthday(p.birthday)}${next ? ` · ${daysUntil(next)}d` : ""}` : "No birthday set"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  {self ? <span className="text-xs text-muted">hidden</span> : (
                    <>
                      <div className="font-bold">{pipe.total}</div>
                      <div className="text-xs text-muted">ideas</div>
                    </>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Shell>
  );
}
