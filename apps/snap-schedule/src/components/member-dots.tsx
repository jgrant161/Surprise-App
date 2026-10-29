import type { Member } from "@/db/schema";

export function MemberDots({ members, ids, size = "sm" }: { members: Member[]; ids: string[]; size?: "sm" | "md" }) {
  const list = members.filter((m) => ids.includes(m.id));
  if (list.length === 0) return null;
  const dim = size === "sm" ? "h-5 w-5 text-[10px]" : "h-7 w-7 text-xs";
  return (
    <span className="flex -space-x-1.5">
      {list.map((m) => (
        <span
          key={m.id}
          title={m.name}
          className={`${dim} flex items-center justify-center rounded-full border-2 border-card font-semibold text-white`}
          style={{ backgroundColor: m.color }}
        >
          {m.name[0]?.toUpperCase()}
        </span>
      ))}
    </span>
  );
}
