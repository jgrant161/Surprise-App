import { joinLocal } from "@/lib/dates";

export type EventFormValues = {
  title: string;
  startsAt: string;
  endsAt: string | null;
  allDay: boolean;
  location: string | null;
  bring: string | null;
  notes: string | null;
  driverMemberId: string | null;
  memberIds: string[];
};

const str = (v: FormDataEntryValue | null) => (typeof v === "string" ? v.trim() : "");
const opt = (v: FormDataEntryValue | null) => str(v) || null;

/** Parse the fields of one event from a form. `prefix` lets several events share one <form>. */
export function parseEventForm(form: FormData, prefix = ""): EventFormValues | { error: string } {
  const title = str(form.get(`${prefix}title`));
  const date = str(form.get(`${prefix}date`));
  if (!title) return { error: "Title is required" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Date is required" };
  const allDay = form.get(`${prefix}allDay`) === "on";
  const start = str(form.get(`${prefix}startTime`));
  const end = str(form.get(`${prefix}endTime`));
  const startsAt = allDay || !start ? date : joinLocal(date, start);
  const endsAt = allDay || !end ? null : joinLocal(date, end);
  return {
    title,
    startsAt,
    endsAt: endsAt && endsAt > startsAt ? endsAt : null,
    allDay: allDay || !start,
    location: opt(form.get(`${prefix}location`)),
    bring: opt(form.get(`${prefix}bring`)),
    notes: opt(form.get(`${prefix}notes`)),
    driverMemberId: opt(form.get(`${prefix}driver`)),
    memberIds: form.getAll(`${prefix}members`).map(String),
  };
}
