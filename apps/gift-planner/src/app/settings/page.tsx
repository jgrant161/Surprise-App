import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listHouseholdUsers } from "@/lib/households";
import { SUPPORT_EMAIL } from "@/lib/legal";
import { Shell } from "@/components/Shell";
import { Plain } from "@/components/Plain";
import { Avatar } from "@/components/Avatar";
import { InviteCard } from "@/components/InviteCard";
import { ConfirmButton } from "@/components/ConfirmButton";
import { DeleteAccountForm } from "./delete-account-form";
import { deleteMyAccount, leaveCurrentHousehold, signOutAction } from "./actions";
import { regenerateInvite, renameHousehold } from "@/app/actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, household, person, role } = await requireUser();
  const seatmates = household ? await listHouseholdUsers(household.id) : [];

  const body = (
    <>
      <section className="card mb-4 text-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Account</h2>
        <p>{user.email}</p>
        {person && <p className="mt-1 text-muted">You are <strong>{person.name}</strong> in this household. Gifts for {person.name} are hidden from you.</p>}
        <form action={signOutAction} className="mt-3">
          <button className="btn-secondary">Sign out</button>
        </form>
      </section>

      {household ? (
        <>
          <InviteCard householdName={household.name} code={household.inviteCode} canRegenerate={role === "owner"} regenerate={regenerateInvite} />

          <section className="card mb-4 text-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Household</h2>
            <form action={renameHousehold} className="flex gap-2">
              <input name="name" defaultValue={household.name} maxLength={60} className="input" aria-label="Household name" />
              <button className="btn-secondary shrink-0">Save</button>
            </form>
            <h3 className="mb-1 mt-4 text-xs font-semibold text-muted">Who signs in</h3>
            <ul className="divide-y divide-line">
              {seatmates.map((s) => (
                <li key={s.userId} className="flex items-center gap-2 py-2">
                  <Avatar name={s.personName} color={s.personColor} size={24} />
                  <span className="flex-1">
                    <span className="font-medium">{s.personName}</span>
                    <span className="text-muted"> · {s.email}</span>
                  </span>
                  <span className="pill bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">{s.role}</span>
                </li>
              ))}
            </ul>
            <form action={leaveCurrentHousehold} className="mt-3">
              <ConfirmButton message={seatmates.length === 1 ? "You're the only one here. Leaving deletes the whole household and every idea in it. Continue?" : "Leave this household? Your person stays on the list as a recipient."} className="btn-ghost btn-sm text-red-600">
                Leave household
              </ConfirmButton>
            </form>
          </section>

          <section className="card mb-4 text-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">Plan</h2>
            <p>
              <strong>{household.name}</strong> is on the <strong>{household.plan === "pro" ? "Pro" : "Free"}</strong> plan.
            </p>
            {household.plan === "free" ? (
              <Link href="/upgrade" className="btn-primary mt-3">Go Pro</Link>
            ) : (
              <p className="mt-1 text-xs text-muted">Manage or cancel the subscription from your phone&apos;s App Store or Google Play subscriptions page.</p>
            )}
          </section>
        </>
      ) : (
        <section className="card mb-4 text-sm">
          <p className="text-muted">You&apos;re not in a household yet.</p>
          <Link href="/welcome" className="btn-primary mt-3">Start or join one</Link>
        </section>
      )}

      <section className="card mb-4 text-sm">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">About</h2>
        <p className="space-x-3">
          <Link href="/privacy" className="underline">Privacy Policy</Link>
          <Link href="/terms" className="underline">Terms of Service</Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">Contact support</a>
        </p>
      </section>

      <section className="card border-red-200 text-sm dark:border-red-900">
        <h2 className="mb-2 text-sm font-semibold text-red-600">Delete my account</h2>
        <p className="text-muted">
          Removes your sign-in and every session. If you are the only person who signs in to your household, the household and all of its people, occasions, ideas and budgets are deleted too. This cannot be undone.
        </p>
        <DeleteAccountForm action={deleteMyAccount} />
      </section>
    </>
  );

  return person ? <Shell viewer={person} title="Settings">{body}</Shell> : <Plain>{body}</Plain>;
}
