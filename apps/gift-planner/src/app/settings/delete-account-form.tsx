"use client";

import { useState } from "react";

export function DeleteAccountForm({ action }: { action: (form: FormData) => Promise<void> }) {
  const [checked, setChecked] = useState(false);
  return (
    <form action={action} className="mt-3 space-y-3">
      <label className="flex items-start gap-2">
        <input type="checkbox" name="confirm" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="mt-0.5 h-4 w-4" />
        <span>I understand this permanently deletes my account and data.</span>
      </label>
      <button type="submit" disabled={!checked} className="btn-secondary text-red-600">Delete my account</button>
    </form>
  );
}
