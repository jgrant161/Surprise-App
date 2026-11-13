import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Plain } from "@/components/Plain";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(session.household ? "/" : "/welcome");
  return (
    <Plain>
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted">We&apos;ll email you a 6-digit code. No password to remember.</p>
      <LoginForm />
      <p className="mt-8 text-center text-xs text-muted">
        By continuing you agree to the <Link href="/terms" className="underline">Terms</Link> and{" "}
        <Link href="/privacy" className="underline">Privacy Policy</Link>.
      </p>
    </Plain>
  );
}
