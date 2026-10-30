import { getMembers } from "@/db/queries";
import { requireFamily } from "@/lib/auth";
import { listFamilyUsers } from "@/lib/families";
import { PageHeader } from "@/components/page-header";
import { PALETTE, TIMEZONES } from "@/lib/palette";
import { InviteCard } from "@/components/invite-card";
import { ConfirmButton } from "@/components/confirm-button";
import { addMember, deleteMember, leaveCurrentFamily, regenerateInvite, updateFamily, updateMember } from "./actions";

export const metadata = { title: "Family" };

export default async function FamilyPage() {
  const { user, family, role } = await requireFamily();
  const [members, people] = await Promise.all([getMembers(family.id), listFamilyUsers(family.id)]);

  return (
    <>
      <PageHeader title="Family" subtitle="Who shows up on the calendar, and who can drive." />

      <InviteCard familyName={family.name} code={family.inviteCode} canRegenerate={role === "owner"} regenerate={regenerateInvite} />

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

      <section className="card mb-4">
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

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold text-muted">Signed-in grown-ups</h2>
        <ul className="space-y-1 text-sm">
          {people.map((p) => (
            <li key={p.userId} className="flex items-center justify-between">
              <span className={p.userId === user.id ? "font-medium" : ""}>{p.email}{p.userId === user.id ? " (you)" : ""}</span>
              <span className="text-xs uppercase tracking-wide text-muted">{p.role}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">Share the invite code above so another parent can sign in and see the same calendar.</p>
        <form action={leaveCurrentFamily} className="mt-3">
          <ConfirmButton
            className="btn-danger"
            message={people.length === 1 ? "You are the only grown-up here. Leaving deletes this family and all its events. Continue?" : "Leave this family? You can rejoin with the invite code."}
          >
            Leave family
          </ConfirmButton>
        </form>
      </section>
    </>
  );
}
