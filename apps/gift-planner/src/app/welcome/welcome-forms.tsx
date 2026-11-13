"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Claimable = { id: string; name: string; color: string };

async function post(url: string, body: Record<string, string | null>) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Something went wrong");
  return data;
}

export function WelcomeForms() {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join">("create");
  const [name, setName] = useState("");
  const [yourName, setYourName] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [preview, setPreview] = useState<{ name: string; people: Claimable[] } | null>(null);
  const [pick, setPick] = useState<string>(""); // person id, or "new"
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function done() {
    router.push("/");
    router.refresh();
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/api/household", { name, yourName });
      done();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = (await post("/api/household/lookup", { code: codeInput })) as { name: string; people: Claimable[] };
      setPreview({ name: data.name, people: data.people });
      setPick(data.people[0]?.id ?? "new");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/api/household/join", { code: codeInput, personId: pick === "new" ? null : pick, yourName: pick === "new" ? yourName : null });
      done();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  const err = error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>;

  return (
    <div className="mt-6">
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-accent-soft/60 p-1 text-sm font-medium">
        {(["create", "join"] as const).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); setError(null); }} className={`rounded-lg py-1.5 ${mode === m ? "bg-card shadow" : "text-muted"}`}>
            {m === "create" ? "Start a household" : "Join with a code"}
          </button>
        ))}
      </div>

      {mode === "create" ? (
        <form onSubmit={create} className="card space-y-3">
          <div>
            <label className="label" htmlFor="hh">Household name</label>
            <input id="hh" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} placeholder="The Grants" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="me">Your name, as the family knows you</label>
            <input id="me" value={yourName} onChange={(e) => setYourName(e.target.value)} required maxLength={40} placeholder="Mom" className="input" />
            <p className="mt-1 text-xs text-muted">Gifts meant for this name will be hidden from you.</p>
          </div>
          <button type="submit" disabled={busy || !name.trim() || !yourName.trim()} className="btn-primary w-full">{busy ? "Creating…" : "Create household"}</button>
          {err}
        </form>
      ) : !preview ? (
        <form onSubmit={lookup} className="card space-y-3">
          <div>
            <label className="label" htmlFor="code">Invite code</label>
            <input id="code" value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} required maxLength={10} placeholder="ABCD2345" className="input font-mono text-xl tracking-[0.3em]" autoCapitalize="characters" />
            <p className="mt-1 text-xs text-muted">Whoever set up the household finds it under Settings → Invite code.</p>
          </div>
          <button type="submit" disabled={busy || codeInput.length < 8} className="btn-primary w-full">{busy ? "Looking…" : "Continue"}</button>
          {err}
        </form>
      ) : (
        <form onSubmit={join} className="card space-y-3">
          <p className="text-sm">Joining <strong>{preview.name}</strong>. Which one are you?</p>
          <div className="grid gap-2">
            {preview.people.map((p) => (
              <label key={p.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${pick === p.id ? "border-accent bg-accent-soft/60" : "border-line"}`}>
                <input type="radio" name="pick" value={p.id} checked={pick === p.id} onChange={() => setPick(p.id)} className="h-4 w-4" />
                <span className="inline-block h-6 w-6 rounded-full" style={{ backgroundColor: p.color }} aria-hidden />
                <span className="font-medium">{p.name}</span>
              </label>
            ))}
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${pick === "new" ? "border-accent bg-accent-soft/60" : "border-line"}`}>
              <input type="radio" name="pick" value="new" checked={pick === "new"} onChange={() => setPick("new")} className="h-4 w-4" />
              <span className="font-medium">I&apos;m not on the list yet</span>
            </label>
          </div>
          {pick === "new" && (
            <div>
              <label className="label" htmlFor="me2">Your name</label>
              <input id="me2" value={yourName} onChange={(e) => setYourName(e.target.value)} required maxLength={40} placeholder="Aunt Kim" className="input" />
            </div>
          )}
          <p className="text-xs text-muted">From now on, gifts for the person you pick are hidden from you.</p>
          <button type="submit" disabled={busy || !pick || (pick === "new" && !yourName.trim())} className="btn-primary w-full">{busy ? "Joining…" : "Join household"}</button>
          <button type="button" onClick={() => { setPreview(null); setError(null); }} className="btn-ghost w-full text-xs">Different code</button>
          {err}
        </form>
      )}
    </div>
  );
}
