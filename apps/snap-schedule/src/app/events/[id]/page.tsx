import Link from "next/link";
import { notFound } from "next/navigation";
import { getEvent, getFamily, getMembers } from "@/db/queries";
import { PageHeader } from "@/components/page-header";
import { MemberDots } from "@/components/member-dots";
import { datePart, formatEventTime, formatLongDate } from "@/lib/dates";
import { googleCalendarUrl } from "@/lib/ics";
import { EditEventForm } from "./edit-form";
import { deleteEvent, updateEvent } from "./actions";

export default async function EventPage({ params, searchParams }: PageProps<"/events/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
  const event = await getEvent(id);
  if (!event) notFound();
  const family = await getFamily();
  const members = await getMembers(family.id);
  const editing = sp.edit === "1";

  const description = [event.bring ? `Bring: ${event.bring}` : null, event.driver ? `Driver: ${event.driver.name}` : null, event.notes]
    .filter(Boolean)
    .join("\n");
  const gcal = googleCalendarUrl({
    uid: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    allDay: event.allDay,
    location: event.location,
    description,
    updatedAt: event.updatedAt,
  });

  if (editing) {
    return (
      <>
        <PageHeader title="Edit event" />
        <EditEventForm event={event} members={members} action={updateEvent.bind(null, event.id)} deleteAction={deleteEvent.bind(null, event.id)} />
      </>
    );
  }

  return (
    <>
      <Link href="/" className="mb-3 inline-block text-sm text-muted hover:text-foreground">← Back</Link>
      <PageHeader
        title={event.title}
        subtitle={`${formatLongDate(datePart(event.startsAt))} · ${formatEventTime(event.startsAt, event.endsAt, event.allDay)}`}
        action={<Link href={`/events/${event.id}?edit=1`} className="btn-secondary py-1.5">Edit</Link>}
      />
      {event.status === "draft" && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          This event is still a draft. <Link className="underline" href={`/snaps/${event.snapId}/review`}>Review the snap</Link> to confirm it.
        </p>
      )}
      <dl className="card space-y-3 text-sm">
        {event.location && <Row label="Where">{event.location}</Row>}
        <Row label="Who">
          {event.memberIds.length ? (
            <span className="flex items-center gap-2">
              <MemberDots members={members} ids={event.memberIds} size="md" />
              {members.filter((m) => event.memberIds.includes(m.id)).map((m) => m.name).join(", ")}
            </span>
          ) : (
            <span className="text-muted">Whole family</span>
          )}
        </Row>
        {event.driver && <Row label="Drives">🚗 {event.driver.name}</Row>}
        {event.bring && <Row label="Bring">🎒 {event.bring}</Row>}
        {event.notes && <Row label="Notes">{event.notes}</Row>}
        {event.sourceText && (
          <Row label="Source">
            <span className="text-muted">“{event.sourceText}”</span>
          </Row>
        )}
      </dl>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a href={gcal} target="_blank" rel="noreferrer" className="btn-secondary">Add to Google Calendar</a>
        <a href={`/api/events/${event.id}/ics`} className="btn-secondary">Download .ics</a>
      </div>
      <p className="mt-6 text-center text-xs text-muted">
        Or <Link href="/subscribe" className="underline">subscribe once</Link> and every confirmed event syncs automatically.
      </p>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-muted">{label}</dt>
      <dd className="min-w-0 flex-1">{children}</dd>
    </div>
  );
}
