"use client";

import { useState } from "react";

export function InviteCard({
  familyName,
  code,
  canRegenerate,
  regenerate,
}: {
  familyName: string;
  code: string;
  canRegenerate: boolean;
  regenerate: () => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const message = `Join "${familyName}" on Snap Schedule. Open ${typeof window !== "undefined" ? window.location.origin : ""}/welcome and enter the invite code ${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked; the code is visible anyway */
    }
  }

  async function share() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Snap Schedule invite", text: message });
        return;
      } catch {
        /* user cancelled */
      }
    }
    await copy();
  }

  return (
    <section className="card mb-4">
      <h2 className="mb-1 text-sm font-semibold text-muted">Invite code</h2>
      <p className="mb-3 text-xs text-muted">Another parent signs in with their own email, then enters this code to join your family.</p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-lg bg-border/40 px-3 py-2 font-mono text-xl tracking-[0.3em]">{code}</code>
        <button type="button" onClick={copy} className="btn-secondary py-2">{copied ? "Copied!" : "Copy"}</button>
        <button type="button" onClick={share} className="btn-secondary py-2">Share</button>
        {canRegenerate && (
          <form action={regenerate}>
            <button className="btn-secondary py-2 text-xs" onClick={(e) => { if (!confirm("Old code stops working. Continue?")) e.preventDefault(); }}>
              New code
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
