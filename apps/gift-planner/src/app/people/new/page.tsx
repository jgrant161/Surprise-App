import { requireViewer } from "@/lib/viewer";
import { createPerson } from "@/app/actions";
import { Shell } from "@/components/Shell";
import { PersonFields } from "@/components/PersonForm";

export const metadata = { title: "Add person" };

export default async function NewPersonPage() {
  const viewer = await requireViewer();
  return (
    <Shell viewer={viewer} title="Add a person">
      <form action={createPerson} className="card grid gap-4">
        <PersonFields />
        <button className="btn-primary">Add person</button>
      </form>
    </Shell>
  );
}
