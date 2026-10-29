import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { ideas, IDEA_STATUSES, type Idea, type IdeaStatus } from "@/db/schema";
import { requireViewer } from "@/lib/viewer";
import { getHousehold } from "@/lib/household";
import { getPerson, listPeople, listOccasions, personMap } from "@/lib/queries";
import { ideasVisibleTo, hideSelf, isSelf } from "@/lib/visibility";
import { formatCents } from "@/lib/money";
import { formatBirthday } from "@/lib/dates";
import { hostLabel } from "@/lib/affiliate";
import { updatePerson, deletePerson, createIdea, setIdeaStatus, claimIdea, deleteIdea } from "@/app/actions";
import { Shell } from "@/components/Shell";
import { Avatar } from "@/components/Avatar";
import { StatusPill, STATUS_LABEL } from "@/components/StatusPill";
import { PersonFields } from "@/components/PersonForm";

export default async function PersonPage({ params }: PageProps<"/people/[id]">) {
  const { id } = await params;
  const viewer = await requireViewer();
  const household = await getHousehold();
  const person = await getPerson(household.id, id);
  if (!person) notFound();

  if (isSelf(viewer.id, person.id)) {
    return (
      <Shell viewer={viewer} title={person.name}>
        <div className="card text-center">
          <p className="text-5xl">🙈</p>
          <h2 className="mt-2 text-xl font-bold">No peeking.</h2>
          <p className="mt-1 text-muted">This is your page and your surprises are hidden. Everyone else can see what they&apos;re planning for you.</p>
        </div>
        <details className="card mt-4">
          <summary className="cursor-pointer font-semibold">Edit my profile</summary>
          <form action={updatePerson} className="mt-4 grid gap-4">
            <input type="hidden" name="id" value={person.id} />
            <PersonFields person={person} />
            <button className="btn-primary">Save</button>
          </form>
        </details>
      </Shell>
    );
  }

  const [roster, occasions, rows] = await Promise.all([
    listPeople(household.id),
    listOccasions(household.id),
    db.select().from(ideas).where(and(eq(ideas.forPersonId, person.id), ideasVisibleTo(viewer.id, household.id))),
  ]);
  const list = hideSelf(viewer.id, rows);
  const byId = personMap(roster);
  const active = list.filter((i) => i.status !== "given");
  const given = list.filter((i) => i.status === "given").sort((a, b) => (b.givenYear ?? 0) - (a.givenYear ?? 0));
  const grouped = IDEA_STATUSES.filter((s) => s !== "given").map((s) => ({ status: s, items: active.filter((i) => i.status === s) }));
  const givenByYear = new Map<number, Idea[]>();
  for (const g of given) {
    const y = g.givenYear ?? 0;
    givenByYear.set(y, [...(givenByYear.get(y) ?? []), g]);
  }

  return (
    <Shell viewer={viewer} title={person.name}>
      <section className="card flex items-start gap-3">
        <Avatar name={person.name} color={person.color} size={56} />
        <div className="min-w-0 flex-1 text-sm">
          <p className="text-muted">{person.birthday ? `Birthday ${formatBirthday(person.birthday)}` : "No birthday set"}</p>
          {person.interests && <p className="mt-1"><span className="font-semibold">Likes:</span> {person.interests}</p>}
          {person.sizes && <p><span className="font-semibold">Sizes:</span> {person.sizes}</p>}
          {person.notes && <p className="text-muted">{person.notes}</p>}
        </div>
      </section>

      <details className="card mt-3">
        <summary className="cursor-pointer text-sm font-semibold">Edit profile</summary>
        <form action={updatePerson} className="mt-4 grid gap-4">
          <input type="hidden" name="id" value={person.id} />
          <PersonFields person={person} />
          <button className="btn-primary">Save</button>
        </form>
        <form action={deletePerson} className="mt-3 border-t border-line pt-3">
          <input type="hidden" name="id" value={person.id} />
          <button className="btn-ghost btn-sm text-red-600">Remove {person.name} and all their ideas</button>
        </form>
      </details>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Add an idea</h2>
        <form action={createIdea} className="card grid gap-3">
          <input type="hidden" name="forPersonId" value={person.id} />
          <input name="title" required className="input" placeholder="What is it?" />
          <div className="grid grid-cols-2 gap-3">
            <input name="price" inputMode="decimal" className="input" placeholder="Price $" />
            <select name="occasionId" className="input" defaultValue="">
              <option value="">Any occasion</option>
              {occasions.filter((o) => !o.forPersonId || o.forPersonId === person.id).map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
          <input name="url" type="url" className="input" placeholder="Link (optional)" />
          <input name="sourceQuote" className="input" placeholder="What they said (optional)" />
          <input name="notes" className="input" placeholder="Notes: color, size, where to buy…" />
          <button className="btn-primary">Add idea</button>
        </form>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Gift board · {active.length}</h2>
        {active.length === 0 ? (
          <p className="card text-sm text-muted">No ideas yet. Add one above, or <Link href="/capture" className="underline">capture</Link> something they said.</p>
        ) : (
          <div className="grid gap-4">
            {grouped.filter((g) => g.items.length).map((g) => (
              <div key={g.status}>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><StatusPill status={g.status} /> <span className="text-muted">{g.items.length}</span></h3>
                <ul className="grid gap-2">
                  {g.items.map((i) => <IdeaCard key={i.id} idea={i} viewerId={viewer.id} claimerName={i.claimedByPersonId ? byId.get(i.claimedByPersonId)?.name ?? "someone" : null} occasionName={i.occasionId ? occasions.find((o) => o.id === i.occasionId)?.name ?? null : null} />)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {given.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Given before</h2>
          <div className="card grid gap-3">
            {[...givenByYear.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => (
              <div key={year}>
                <p className="text-xs font-bold text-muted">{year || "Unknown year"}</p>
                <ul className="mt-1 divide-y divide-line text-sm">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-2 py-1.5">
                      <span>{i.title}</span>
                      <span className="text-muted">{formatCents(i.priceCents)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}

const NEXT: Partial<Record<IdeaStatus, IdeaStatus>> = { idea: "planned", planned: "bought", bought: "wrapped", wrapped: "given" };
const PREV: Partial<Record<IdeaStatus, IdeaStatus>> = { planned: "idea", bought: "planned", wrapped: "bought" };

function IdeaCard({ idea, viewerId, claimerName, occasionName }: { idea: Idea; viewerId: string; claimerName: string | null; occasionName: string | null }) {
  const mine = idea.claimedByPersonId === viewerId;
  const next = NEXT[idea.status];
  const prev = PREV[idea.status];
  return (
    <li className="card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-snug">{idea.title}</p>
          <p className="mt-0.5 text-xs text-muted">
            {formatCents(idea.priceCents)}
            {occasionName && <> · {occasionName}</>}
            {idea.url && (
              <> · <a href={`/go/${idea.id}`} target="_blank" rel="noopener" className="underline">{hostLabel(idea.url)}</a></>
            )}
          </p>
          {idea.sourceQuote && <p className="mt-1 text-sm italic text-muted">&ldquo;{idea.sourceQuote}&rdquo;</p>}
          {idea.notes && <p className="mt-1 text-sm">{idea.notes}</p>}
        </div>
        {claimerName && (
          <span className={`pill ${mine ? "bg-accent-soft text-accent" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"}`}>
            {mine ? "You've got this" : `${claimerName} has it`}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {!idea.claimedByPersonId && (
          <form action={claimIdea}><input type="hidden" name="id" value={idea.id} /><button className="btn-secondary btn-sm">I&apos;ve got this</button></form>
        )}
        {mine && (
          <form action={claimIdea}><input type="hidden" name="id" value={idea.id} /><input type="hidden" name="release" value="1" /><button className="btn-ghost btn-sm">Release</button></form>
        )}
        {next && (
          <form action={setIdeaStatus}><input type="hidden" name="id" value={idea.id} /><input type="hidden" name="status" value={next} /><button className="btn-primary btn-sm">Mark {STATUS_LABEL[next].toLowerCase()}</button></form>
        )}
        {prev && (
          <form action={setIdeaStatus}><input type="hidden" name="id" value={idea.id} /><input type="hidden" name="status" value={prev} /><button className="btn-ghost btn-sm">Back to {STATUS_LABEL[prev].toLowerCase()}</button></form>
        )}
        <form action={deleteIdea} className="ml-auto"><input type="hidden" name="id" value={idea.id} /><button className="btn-ghost btn-sm text-red-600">Delete</button></form>
      </div>
    </li>
  );
}
