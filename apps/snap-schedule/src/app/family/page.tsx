import { getFamily, getMembers } from "@/db/queries";
import { PageHeader } from "@/components/page-header";
import { PALETTE, TIMEZONES } from "@/lib/palette";
import { addMember, deleteMember, updateFamily, updateMember } from "./actions";

export const metadata = { title: "Family" };

export default async function FamilyPage() {
  const family = await getFamily();
  const members = await getMembers(family.id);

  return (
    <>
      <PageHeader title="Family" subtitle="Who shows up on the calendar, and who can drive." />

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold text-muted">Members</h2>
        <ul className="space-y-3">
          {members.map((m) => (
            <li key={m.id}>
              <form action={updateMember.bind(null, m.id)} className="flex flex-wrap items-end gap-2">
                <span className="mb-2 h-6 w-6 shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
                <div className="min-w-[8rem] flex-1">
                  <label className="label">Name</label>
                  <input name="name" defaultValue={m.name} className="input" />
                </div>
                <div>
                  <label className="label">Color</label>
                  <select name="color" defaultValue={m.color} className="input">
                    {PALETTE.map((p) => (
                      <option key={p.hex} value={p.hex}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Role</label>
                  <select name="role" defaultValue={m.role} className="input">
                    <option value="kid">Kid</option>
                    <option value="adult">Adult (can drive)</option>
                  </select>
                </div>
                <button className="btn-secondary">Save</button>
                <button formAction={deleteMember.bind(null, m.id)} className="btn-danger">Remove</button>
              </form>
            </li>
          ))}
          {members.length === 0 && <li className="text-sm text-muted">No members yet. Add the family below.</li>}
        </ul>
      </section>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold text-muted">Add a member</h2>
        <form action={addMember} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[8rem] flex-1">
            <label className="label" htmlFor="new-name">Name</label>
            <input id="new-name" name="name" required placeholder="e.g. Ava" className="input" />
          </div>
          <div>
            <label className="label">Color</label>
            <select name="color" defaultValue={PALETTE[(members.length + 2) % PALETTE.length].hex} className="input">
              {PALETTE.map((p) => (
                <option key={p.hex} value={p.hex}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Role</label>
            <select name="role" defaultValue="kid" className="input">
              <option value="kid">Kid</option>
              <option value="adult">Adult (can drive)</option>
            </select>
          </div>
          <button className="btn-primary">Add</button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold text-muted">Family settings</h2>
        <form action={updateFamily} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[8rem] flex-1">
            <label className="label" htmlFor="fam-name">Family name</label>
            <input id="fam-name" name="name" defaultValue={family.name} className="input" />
          </div>
          <div className="min-w-[12rem]">
            <label className="label" htmlFor="tz">Time zone</label>
            <select id="tz" name="timezone" defaultValue={family.timezone} className="input">
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <button className="btn-secondary">Save</button>
        </form>
      </section>
    </>
  );
}
