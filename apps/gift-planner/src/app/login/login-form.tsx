"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "email" | "code";

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function post(url: string, body: Record<string, string>) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Something went wrong");
    return data;
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await post("/api/auth/request-code", { email });
      setDevCode(typeof data.devCode === "string" ? data.devCode : null);
      setStep("code");
      setNotice(data.sent === false ? null : `We sent a code to ${email.trim().toLowerCase()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await post("/api/auth/verify", { email, code });
      router.push(typeof data.next === "string" ? data.next : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
      setBusy(false);
    }
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="card mt-6 space-y-3">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" name="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
        </div>
        <button type="submit" disabled={busy || !email} className="btn-primary w-full">{busy ? "Sending…" : "Email me a code"}</button>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={verify} className="card mt-6 space-y-3">
      {notice && <p className="text-sm text-muted">{notice}</p>}
      {devCode && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold">Dev mode: email sending is off.</p>
          <p>Your code is <code className="font-mono text-lg tracking-widest">{devCode}</code></p>
        </div>
      )}
      <div>
        <label className="label" htmlFor="code">6-digit code</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="input text-center font-mono text-2xl tracking-[0.4em]" />
      </div>
      <button type="submit" disabled={busy || code.length !== 6} className="btn-primary w-full">{busy ? "Checking…" : "Sign in"}</button>
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      <p className="text-center text-xs text-muted">
        Didn&apos;t get it?{" "}
        <button type="button" onClick={() => sendCode()} disabled={busy} className="underline">Resend</button>
        {" · "}
        <button type="button" onClick={() => { setStep("email"); setCode(""); setError(null); }} className="underline">Change email</button>
      </p>
    </form>
  );
}
