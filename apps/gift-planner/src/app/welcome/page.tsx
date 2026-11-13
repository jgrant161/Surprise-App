import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { Plain } from "@/components/Plain";
import { WelcomeForms } from "./welcome-forms";

export const metadata = { title: "Welcome" };

export default async function WelcomePage() {
  const session = await requireUser();
  if (session.household) redirect("/");
  return (
    <Plain>
      <h1 className="text-2xl font-bold tracking-tight">Welcome 🎁</h1>
      <p className="mt-1 text-sm text-muted">Signed in as {session.user.email}. Start a household, or join one someone in your family already set up.</p>
      <WelcomeForms />
    </Plain>
  );
}
