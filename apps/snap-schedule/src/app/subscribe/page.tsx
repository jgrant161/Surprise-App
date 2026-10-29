import { headers } from "next/headers";
import { getFamily, getMembers } from "@/db/queries";
import { PageHeader } from "@/components/page-header";

export const metadata = { title: "Subscribe" };

export default async function SubscribePage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const base = `${proto}://${host}`;
  const family = await getFamily();
  const members = await getMembers(family.id);

  return (
    <>
      <PageHeader title="Subscribe" subtitle="Add the family feed to your phone's calendar once. New confirmed events appear automatically." />
      <div className="card space-y-3 text-sm">
        <Feed label="Whole family" url={`${base}/calendar.ics`} />
        {members.map((m) => (
          <Feed key={m.id} label={m.name} url={`${base}/calendar.ics?member=${m.id}`} color={m.color} />
        ))}
      </div>
      <div className="card mt-4 space-y-2 text-sm text-muted">
        <p><strong className="text-foreground">iPhone:</strong> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar, paste the link.</p>
        <p><strong className="text-foreground">Google Calendar:</strong> On the web, next to “Other calendars” press + → From URL, paste the link.</p>
        <p>Calendars refresh subscribed feeds every few hours; for an instant add use the Google or .ics buttons on an event.</p>
      </div>
    </>
  );
}

function Feed({ label, url, color }: { label: string; url: string; color?: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-2 font-medium">
        {color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />}
        {label}
      </div>
      <input readOnly value={url} className="input font-mono text-xs" onFocus={undefined} />
    </div>
  );
}
