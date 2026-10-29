import { getEvent, getFamily } from "@/db/queries";
import { buildCalendar } from "@/lib/ics";

export async function GET(_req: Request, ctx: RouteContext<"/api/events/[id]/ics">) {
  const { id } = await ctx.params;
  const e = await getEvent(id);
  if (!e) return new Response("Not found", { status: 404 });
  const family = await getFamily();
  const body = buildCalendar(family.name, [
    {
      uid: e.id,
      title: e.title,
      startsAt: e.startsAt,
      endsAt: e.endsAt,
      allDay: e.allDay,
      location: e.location,
      description: [e.bring ? `Bring: ${e.bring}` : null, e.driver ? `Driver: ${e.driver.name}` : null, e.notes].filter(Boolean).join("\n"),
      updatedAt: e.updatedAt,
    },
  ]);
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${e.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics"`,
    },
  });
}
