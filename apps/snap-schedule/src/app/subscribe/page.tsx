import { getMembers } from "@/db/queries";
import { appBaseUrl } from "@/lib/http";
import { requireFamily } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { CopyField } from "@/components/copy-field";
import { ConfirmButton } from "@/components/confirm-button";
import { resetFeedLink } from "@/app/family/actions";

export const metadata = { title: "Subscribe" };

export default async function SubscribePage() {
  const base = await appBaseUrl();
  const { family } = await requireFamily();
  const members = await getMembers(family.id);
  const feed = `${base}/feed/${family.feedToken}.ics`;

  return (
    <>
      <PageHeader title="Subscribe" subtitle="Add the family feed to your phone's calendar once. New confirmed events appear automatically." />
      <div className="card space-y-3 text-sm">
        <Feed label="Whole family" url={feed} />
        {members.map((m) => (
          <Feed key={m.id} label={m.name} url={`${feed}?member=${m.id}`} color={m.color} />
        ))}
      </div>
      <div className="card mt-4 space-y-2 text-sm text-muted">
        <p><strong className="text-foreground">iPhone:</strong> Settings → Calendar → Accounts → Add Account → Other → Add Subscribed Calendar, paste the link.</p>
        <p><strong className="text-foreground">Google Calendar:</strong> On the web, next to “Other calendars” press + → From URL, paste the link.</p>
        <p>Calendars refresh subscribed feeds every few hours; for an instant add use the Google or .ics buttons on an event.</p>
      </div>
      <div className="card mt-4 text-sm">
        <p className="text-muted">Anyone with these links can read your family calendar. If a link leaks, reset it and re-subscribe.</p>
        <form action={resetFeedLink} className="mt-2">
          <ConfirmButton className="btn-secondary" message="Reset the feed link? Everyone who subscribed must add the new link.">
            Reset link
          </ConfirmButton>
        </form>
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
      <CopyField value={url} />
    </div>
  );
}
