import type { NextRequest } from "next/server";
import { getConfirmedEvents, getFamily, getMembers } from "@/db/queries";
import { buildCalendar } from "@/lib/ics";

export async function GET(req: NextRequest) {
  const memberId = req.nextUrl.searchParams.get("member");
  const family = await getFamily();
  const [all, members] = await Promise.all([getConfirmedEvents(family.id), getMembers(family.id)]);
  const member = memberId ? members.find((m) => m.id === memberId) : null;
  const list = member ? all.filter((e) => e.memberIds.includes(member.id) || e.driverMemberId === member.id) : all;
  const body = buildCalendar(member ? `${family.name} · ${member.name}` : family.name, list.map((e) => ({
    uid: e.id,
    title: e.title,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    allDay: e.allDay,
    location: e.location,
    description: [e.bring ? `Bring: ${e.bring}` : null, e.driver ? `Driver: ${e.driver.name}` : null, e.notes].filter(Boolean).join("\n"),
    updatedAt: e.updatedAt,
  })));
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "no-store" },
  });
}
