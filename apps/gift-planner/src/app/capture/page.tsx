import { requireMember } from "@/lib/auth";
import { canCapture } from "@/lib/plans";
import { UpgradeCard } from "@/components/UpgradeCard";
import { listPeople } from "@/lib/queries";
import { isDemoMode } from "@/lib/claude";
import { Shell } from "@/components/Shell";
import { DemoBadge } from "@/components/DemoBadge";
import { CaptureForm } from "./CaptureForm";

export const metadata = { title: "Capture" };

export default async function CapturePage() {
  const { person: viewer, household } = await requireMember();
  const [roster, allowance] = await Promise.all([listPeople(household.id), canCapture(household)]);
  return (
    <Shell viewer={viewer} title="Capture an idea" action={isDemoMode() ? <DemoBadge /> : null}>
      <p className="mb-4 text-sm text-muted">
        Type what you heard, as messy as you like. Claude turns it into gift ideas and guesses who each one is for. You review before anything is saved.
      </p>
      {allowance.ok ? (
        <>
          <CaptureForm people={roster.filter((p) => p.id !== viewer.id).map((p) => ({ id: p.id, name: p.name, color: p.color }))} />
          {allowance.limit != null && <p className="mt-3 text-center text-xs text-muted">{allowance.used} of {allowance.limit} free captures used this month</p>}
        </>
      ) : (
        <UpgradeCard title="Free captures used up for this month" body="You can still add ideas by hand on any person's page. Surprise Stash Pro makes captures unlimited." />
      )}
    </Shell>
  );
}
