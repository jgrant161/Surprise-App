import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { DeleteAccountForm } from "./delete-account-form";
import { deleteMyAccount, signOutAction } from "./actions";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { user, family } = await requireUser();
  return (
    <>
      <PageHeader title="Settings" />
      <section className="card mb-4 text-sm">
        <h2 className="mb-2 text-sm font-semibold text-muted">Account</h2>
        <p>{user.email}</p>
        <form action={signOutAction} className="mt-3">
          <button className="btn-secondary">Sign out</button>
        </form>
      </section>

      <section className="card mb-4 text-sm">
        <h2 className="mb-2 text-sm font-semibold text-muted">Plan</h2>
        {family ? (
          <>
            <p>
              <strong>{family.name}</strong> is on the <strong>{family.plan === "pro" ? "Pro" : "Free"}</strong> plan.
            </p>
            {family.plan === "free" ? (
              <Link href="/upgrade" className="btn-primary mt-3">Go Pro</Link>
            ) : (
              <p className="mt-1 text-xs text-muted">Manage or cancel the subscription from your phone&apos;s App Store or Google Play subscriptions page.</p>
            )}
          </>
        ) : (
          <p className="text-muted">Create or join a family first.</p>
        )}
      </section>

      <section className="card mb-4 text-sm">
        <h2 className="mb-2 text-sm font-semibold text-muted">About</h2>
        <p className="space-x-3">
          <Link href="/privacy" className="underline">Privacy Policy</Link>
          <Link href="/terms" className="underline">Terms of Service</Link>
          <a href={`mailto:${process.env.SUPPORT_EMAIL || "support@example.com"}`} className="underline">Contact support</a>
        </p>
      </section>

      <section className="card border-red-200 text-sm dark:border-red-900">
        <h2 className="mb-2 text-sm font-semibold text-red-600">Delete my account</h2>
        <p className="text-muted">
          Removes your sign-in and every session. If you are the only grown-up in your family, the family, its members, snaps and events are deleted too. This cannot be undone.
        </p>
        <DeleteAccountForm action={deleteMyAccount} />
      </section>
    </>
  );
}
