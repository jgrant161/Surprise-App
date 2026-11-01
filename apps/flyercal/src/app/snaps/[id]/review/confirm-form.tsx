"use client";

import { useActionState } from "react";

type Action = (form: FormData) => Promise<{ error: string } | void>;

export function ConfirmForm({ action, count, children }: { action: Action; count: number; children: React.ReactNode }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error: string } | null, form: FormData) => (await action(form)) ?? null,
    null,
  );
  return (
    <form action={formAction} className="space-y-4">
      {children}
      {state?.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{state.error}</p>}
      <div className="sticky bottom-20 z-10">
        <button type="submit" disabled={pending || count === 0} className="btn-primary w-full shadow-lg">
          {pending ? "Saving…" : count === 0 ? "Nothing to confirm" : `Confirm ${count} event${count === 1 ? "" : "s"}`}
        </button>
      </div>
    </form>
  );
}
