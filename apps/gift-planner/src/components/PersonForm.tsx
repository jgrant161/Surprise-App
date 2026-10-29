import type { Person } from "@/db/schema";

const COLORS = ["#d9486b", "#ec4899", "#8b5cf6", "#3b82f6", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444", "#78716c"];

export function PersonFields({ person }: { person?: Person }) {
  return (
    <div className="grid gap-3">
      <div>
        <label className="label" htmlFor="name">Name</label>
        <input id="name" name="name" required defaultValue={person?.name} className="input" placeholder="Grandma Jo" />
      </div>
      <div>
        <label className="label" htmlFor="birthday">Birthday</label>
        <input id="birthday" name="birthday" defaultValue={person?.birthday ?? ""} className="input" placeholder="YYYY-MM-DD or MM-DD" pattern="(\d{4}-)?\d{2}-\d{2}" />
      </div>
      <div>
        <label className="label" htmlFor="interests">Interests</label>
        <input id="interests" name="interests" defaultValue={person?.interests} className="input" placeholder="gardening, mystery novels, tea" />
      </div>
      <div>
        <label className="label" htmlFor="sizes">Sizes</label>
        <input id="sizes" name="sizes" defaultValue={person?.sizes} className="input" placeholder="M tops, 8 shoes" />
      </div>
      <div>
        <label className="label" htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" defaultValue={person?.notes} className="input" rows={2} placeholder="Already has… / allergic to… / prefers experiences" />
      </div>
      <div>
        <span className="label">Color</span>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <label key={c} className="cursor-pointer">
              <input type="radio" name="color" value={c} defaultChecked={(person?.color ?? COLORS[6]) === c} className="peer sr-only" />
              <span className="block h-8 w-8 rounded-full ring-offset-2 ring-offset-card peer-checked:ring-2 peer-checked:ring-foreground" style={{ backgroundColor: c }} />
            </label>
          ))}
        </div>
      </div>
      <div className="card grid gap-2 bg-background">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" name="isMember" defaultChecked={person?.isMember === 1} className="h-4 w-4" />
          Uses this app (can sign in and plan gifts for others)
        </label>
        <div>
          <label className="label" htmlFor="pin">4-digit PIN (members only, optional)</label>
          <input id="pin" name="pin" inputMode="numeric" pattern="[0-9]{4}" maxLength={4} defaultValue={person?.pin ?? ""} className="input w-32" placeholder="1234" />
          <p className="mt-1 text-xs text-muted">Keeps kids from opening a parent&apos;s view. Leave blank for none.</p>
        </div>
      </div>
    </div>
  );
}
