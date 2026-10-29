import type { Member } from "@/db/schema";
import type { EventWithPeople } from "@/db/queries";
import { datePart, timePart } from "@/lib/dates";

/** Form fields for one event. Used by the review page (many per form) and the edit page. */
export function EventFields({ event, members, prefix = "" }: { event: EventWithPeople; members: Member[]; prefix?: string }) {
  const n = (k: string) => `${prefix}${k}`;
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <label className="label" htmlFor={n("title")}>Title</label>
        <input id={n("title")} name={n("title")} defaultValue={event.title} required className="input" />
      </div>
      <div>
        <label className="label" htmlFor={n("date")}>Date</label>
        <input id={n("date")} name={n("date")} type="date" defaultValue={datePart(event.startsAt)} required className="input" />
      </div>
      <div className="flex items-end pb-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={n("allDay")} defaultChecked={event.allDay} className="h-4 w-4 accent-accent" />
          All day
        </label>
      </div>
      <div>
        <label className="label" htmlFor={n("startTime")}>Start</label>
        <input id={n("startTime")} name={n("startTime")} type="time" defaultValue={timePart(event.startsAt) ?? ""} className="input" />
      </div>
      <div>
        <label className="label" htmlFor={n("endTime")}>End</label>
        <input id={n("endTime")} name={n("endTime")} type="time" defaultValue={event.endsAt ? timePart(event.endsAt) ?? "" : ""} className="input" />
      </div>
      <div className="col-span-2">
        <label className="label" htmlFor={n("location")}>Location</label>
        <input id={n("location")} name={n("location")} defaultValue={event.location ?? ""} className="input" />
      </div>
      <div className="col-span-2">
        <label className="label" htmlFor={n("bring")}>Bring / wear / pay</label>
        <input id={n("bring")} name={n("bring")} defaultValue={event.bring ?? ""} className="input" placeholder="water bottle, cleats, $5" />
      </div>
      <div className="col-span-2">
        <label className="label" htmlFor={n("notes")}>Notes</label>
        <input id={n("notes")} name={n("notes")} defaultValue={event.notes ?? ""} className="input" />
      </div>
      {members.length > 0 && (
        <div className="col-span-2">
          <span className="label">Who&apos;s going</span>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <label key={m.id} className="cursor-pointer">
                <input type="checkbox" name={n("members")} value={m.id} defaultChecked={event.memberIds.includes(m.id)} className="peer sr-only" />
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm peer-checked:border-transparent peer-checked:text-white peer-checked:[background-color:var(--chip)]"
                  style={{ ["--chip" as string]: m.color }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  {m.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="col-span-2">
        <label className="label" htmlFor={n("driver")}>Who drives</label>
        <select id={n("driver")} name={n("driver")} defaultValue={event.driverMemberId ?? ""} className="input">
          <option value="">Nobody / not needed</option>
          {members.filter((m) => m.role === "adult").map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
