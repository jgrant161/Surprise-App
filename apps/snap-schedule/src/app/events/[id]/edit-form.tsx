"use client";

import { useActionState } from "react";
import type { Member } from "@/db/schema";
import type { EventWithPeople } from "@/db/queries";
import { EventFields } from "@/components/event-fields";

type State = { error: string } | null;

export function EditEventForm({
  event,
  members,
  action,
  deleteAction,
}: {
  event: EventWithPeople;
  members: Member[];
  action: (prev: State, form: FormData) => Promise<State>;
  deleteAction: () => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      <div className="card">
        <EventFields event={event} members={members} />
      </div>
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{state.error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn-primary flex-1">{pending ? "Saving…" : "Save"}</button>
        <a href={`/events/${event.id}`} className="btn-secondary">Cancel</a>
        <button type="button" onClick={() => { if (confirm("Delete this event?")) deleteAction(); }} className="btn-danger">Delete</button>
      </div>
    </form>
  );
}
