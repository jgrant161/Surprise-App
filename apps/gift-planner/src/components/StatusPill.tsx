import type { IdeaStatus } from "@/db/schema";

export const STATUS_LABEL: Record<IdeaStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  bought: "Bought",
  wrapped: "Wrapped",
  given: "Given",
};

const STYLE: Record<IdeaStatus, string> = {
  idea: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
  planned: "bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
  bought: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  wrapped: "bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-200",
  given: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
};

export function StatusPill({ status }: { status: IdeaStatus }) {
  return <span className={`pill ${STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}
