"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WelcomeForms({ timezones }: { timezones: readonly string[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const guessTz = typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "";
  const [timezone, setTimezone] = useState(timezones.includes(guessTz) ? guessTz : timezones[0]);
  const [codeInput, setCodeInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(mode === "create" ? "/api/family" : "/api/family/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "create" ? { name, timezone } : { code: codeInput }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push("/family");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="mb-4 grid grid-cols-2 rounded-lg bg-border/50 p-1 text-sm font-medium">
        {(["create", "join"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-md py-1.5 ${mode === m ? "bg-card shadow" : "text-muted"}`}>
            {m === "create" ? "Create a family" : "Join with a code"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="card space-y-3">
        {mode === "create" ? (
          <>
            <div>
              <label className="label" htmlFor="fam">Family name</label>
              <input id="fam" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="The Grants" className="input" />
            </div>
            <div>
              <label className="label" htmlFor="tz">Time zone</label>
              <select id="tz" value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input">
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={busy || !name.trim()} className="btn-primary w-full">{busy ? "Creating…" : "Create family"}</button>
          </>
        ) : (
          <>
            <div>
              <label className="label" htmlFor="code">Invite code</label>
              <input id="code" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} required maxLength={10} placeholder="ABCD2345" className="input font-mono text-xl tracking-[0.3em]" autoCapitalize="characters" />
              <p className="mt-1 text-xs text-muted">The other parent finds it under Family → Invite code.</p>
            </div>
            <button type="submit" disabled={busy || codeInput.length < 8} className="btn-primary w-full">{busy ? "Joining…" : "Join family"}</button>
          </>
        )}
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
      </form>
    </div>
  );
}
