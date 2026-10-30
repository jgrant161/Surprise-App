import { getEvent } from "@/db/queries";
import { getSession } from "@/lib/auth";
import { buildCalendar } from "@/lib/ics";

export async function GET(_req: Request, ctx: RouteContext<"/api/events/[id]/ics">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session?.family) return new Response("Not found", { status: 404 });
  const family = session.family;
  const e = await getEvent(family.id, id);
  if (!e) return new Response("Not found", { status: 404 });
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
