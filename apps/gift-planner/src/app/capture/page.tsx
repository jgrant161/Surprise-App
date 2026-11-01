import { requireViewer } from "@/lib/viewer";
import { getHousehold } from "@/lib/household";
import { listPeople } from "@/lib/queries";
import { isDemoMode } from "@/lib/claude";
import { Shell } from "@/components/Shell";
import { DemoBadge } from "@/components/DemoBadge";
import { CaptureForm } from "./CaptureForm";

export const metadata = { title: "Capture" };

export default async function CapturePage() {
  const viewer = await requireViewer();
  const household = await getHousehold();
  const roster = await listPeople(household.id);
  return (
    <Shell viewer={viewer} title="Capture an idea" action={isDemoMode() ? <DemoBadge /> : null}>
      <p className="mb-4 text-sm text-muted">
        Type what you heard, as messy as you like. Claude turns it into gift ideas and guesses who each one is for. You review before anything is saved.
      </p>
      <CaptureForm people={roster.filter((p) => p.id !== viewer.id).map((p) => ({ id: p.id, name: p.name, color: p.color }))} />
    </Shell>
  );
}
