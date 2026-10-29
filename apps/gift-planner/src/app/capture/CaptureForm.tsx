"use client";

import { useActionState } from "react";
import { captureIdeas, saveCapturedIdeas, type CaptureResult } from "@/app/actions";
import { centsToDollarInput } from "@/lib/money";
import { DemoBadge } from "@/components/DemoBadge";

type PersonOpt = { id: string; name: string; color: string };

export function CaptureForm({ people }: { people: PersonOpt[] }) {
  const [result, action, pending] = useActionState<CaptureResult | null, FormData>(captureIdeas, null);

  return (
    <div className="grid gap-4">
      <form action={action} className="card grid gap-3">
        <textarea
          name="text"
          required
          rows={4}
          className="input"
          defaultValue={result && result.ok ? result.text : ""}
          placeholder="Mom said she wants a garden kneeler, and Jake keeps talking about the Lego Rivendell set."
        />
        <button className="btn-primary" disabled={pending}>{pending ? "Thinking…" : "Find the gift ideas"}</button>
        {result && !result.ok && <p className="text-sm text-red-600">{result.error}</p>}
      </form>

      {result && result.ok && (
        <form action={saveCapturedIdeas} className="grid gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Review · {result.items.length}</h2>
            {result.demo && <DemoBadge />}
          </div>
          {result.hiddenCount > 0 && (
            <p className="rounded-xl bg-accent-soft px-3 py-2 text-sm text-accent">
              {result.hiddenCount} idea{result.hiddenCount === 1 ? " was" : "s were"} about you and {result.hiddenCount === 1 ? "was" : "were"} hidden. Someone else can capture those.
            </p>
          )}
          {result.items.length === 0 && result.hiddenCount === 0 && <p className="card text-sm text-muted">No gift ideas found in that note.</p>}
          {result.items.map((item) => (
            <div key={item.key} className="card grid gap-2">
              <label className="flex items-center gap-2 text-sm font-semibold">
                <input type="checkbox" name="keep" value={item.key} defaultChecked className="h-4 w-4" />
                Save this one
              </label>
              <input name={`title_${item.key}`} defaultValue={item.title} className="input font-semibold" />
              <div className="grid grid-cols-2 gap-2">
                <select name={`person_${item.key}`} defaultValue={item.personId ?? ""} className="input" required>
                  <option value="" disabled>Who is it for?</option>
                  {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input name={`price_${item.key}`} defaultValue={centsToDollarInput(item.priceCents)} inputMode="decimal" className="input" placeholder="Price $" />
              </div>
              {item.sourceQuote && <p className="text-sm italic text-muted">&ldquo;{item.sourceQuote}&rdquo;</p>}
              <input type="hidden" name={`quote_${item.key}`} value={item.sourceQuote ?? ""} />
              <input name={`notes_${item.key}`} defaultValue={item.notes} className="input" placeholder="Notes" />
            </div>
          ))}
          {result.items.length > 0 && <button className="btn-primary">Save selected ideas</button>}
        </form>
      )}
    </div>
  );
}
