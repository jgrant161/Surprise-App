import Link from "next/link";
import { redirect } from "next/navigation";
import { getMembers, getSnapsNeedingReview, getUpcomingEvents } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { maybePurgeStaleImages } from "@/lib/snaps";
import { Landing } from "@/components/landing";
import { localNow, toDateKey, datePart, formatDayHeading, formatEventTime } from "@/lib/dates";
import { MemberDots } from "@/components/member-dots";
import { PageHeader } from "@/components/page-header";
import { hasApiKey } from "@/lib/claude";
import { DemoBadge } from "@/components/demo-badge";

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const filter = typeof sp.member === "string" ? sp.member : null;
  const session = await getSession();
  if (!session) return <Landing />;
  if (!session.family) redirect("/welcome");
  const family = session.family;
  await maybePurgeStaleImages();
  const [members, upcoming, pending] = await Promise.all([
    getMembers(family.id),
    getUpcomingEvents(family.id, family.timezone, 30),
    getSnapsNeedingReview(family.id),
  ]);
  const todayKey = toDateKey(localNow(family.timezone));
  const visible = filter ? upcoming.filter((e) => e.memberIds.includes(filter) || e.driverMemberId === filter) : upcoming;
  const byDay = new Map<string, typeof visible>();
  for (const e of visible) {
    const k = datePart(e.startsAt);
    byDay.set(k, [...(byDay.get(k) ?? []), e]);
  }

  return (
    <>
      <PageHeader
        title="Coming up"
        subtitle={`${family.name} · next 30 days`}
        action={!hasApiKey() ? <DemoBadge /> : undefined}
      />

      {pending.length > 0 && (
        <Link
          href={pending.length === 1 ? `/snaps/${pending[0].id}/review` : "/snap"}
          className="mb-4 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        >
          <span>
            <strong>{pending.length}</strong> snap{pending.length > 1 ? "s" : ""} waiting for your review
          </span>
          <span aria-hidden>→</span>
        </Link>
      )}

      {members.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <Link href="/" className={`shrink-0 rounded-full border px-3 py-1 text-sm ${!filter ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card"}`}>
            Everyone
          </Link>
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/?member=${m.id}`}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${filter === m.id ? "border-accent bg-accent text-accent-foreground" : "border-border bg-card"}`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
              {m.name}
            </Link>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="card mt-6 text-center">
          <p className="text-4xl">📸</p>
          <h2 className="mt-2 text-lg font-semibold">Nothing on the calendar yet</h2>
          <p className="mt-1 text-sm text-muted">
            Snap a photo of a school newsletter, team schedule or flyer, and the events show up here.
          </p>
          <Link href="/snap" className="btn-primary mt-4">
            Snap a schedule
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {[...byDay.entries()].map(([day, list]) => (
            <section key={day}>
              <h2 className="mb-2 text-sm font-semibold text-muted">{formatDayHeading(day, todayKey)}</h2>
              <ul className="space-y-2">
                {list.map((e) => (
                  <li key={e.id}>
                    <Link href={`/events/${e.id}`} className="card flex gap-3 hover:border-accent/50">
                      <div className="w-[4.5rem] shrink-0 text-sm font-medium text-muted">
                        {formatEventTime(e.startsAt, e.endsAt, e.allDay)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold leading-tight">{e.title}</h3>
                          <MemberDots members={members} ids={e.memberIds} />
                        </div>
                        {e.location && <p className="mt-0.5 truncate text-sm text-muted">{e.location}</p>}
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted">
                          {e.driver && <span>🚗 {e.driver.name} drives</span>}
                          {e.bring && <span>🎒 {e.bring}</span>}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted">
        <Link href="/subscribe" className="underline">
          Subscribe to this calendar
        </Link>{" "}
        on your phone.
      </p>
    </>
  );
}
