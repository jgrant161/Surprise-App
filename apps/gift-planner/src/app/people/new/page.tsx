import { requireMember } from "@/lib/auth";
import { canAddPerson } from "@/lib/plans";
import { UpgradeCard } from "@/components/UpgradeCard";
import { createPerson } from "@/app/actions";
import { Shell } from "@/components/Shell";
import { PersonFields } from "@/components/PersonForm";

export const metadata = { title: "Add person" };

export default async function NewPersonPage() {
  const { person: viewer, household } = await requireMember();
  const allowance = await canAddPerson(household);
  return (
    <Shell viewer={viewer} title="Add a person">
      {allowance.ok ? (
        <form action={createPerson} className="card grid gap-4">
          <PersonFields />
          <button className="btn-primary">Add person</button>
          {allowance.limit != null && <p className="text-center text-xs text-muted">{allowance.used} of {allowance.limit} free people used</p>}
        </form>
      ) : (
        <UpgradeCard title={`Free covers ${allowance.limit} people`} body="Your household is at the free limit. Surprise Stash Pro lets you keep a list for everyone, grandparents and all." />
      )}
    </Shell>
  );
}
