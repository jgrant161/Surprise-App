import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { TIMEZONES } from "@/lib/palette";
import { WelcomeForms } from "./welcome-forms";

export const metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const session = await requireUser();
  if (session.family) redirect("/");
  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome 👋</h1>
      <p className="mt-1 text-sm text-muted">Signed in as {session.user.email}. Set up your family, or join one a parent already created.</p>
      <WelcomeForms timezones={TIMEZONES} />
    </div>
  );
}
