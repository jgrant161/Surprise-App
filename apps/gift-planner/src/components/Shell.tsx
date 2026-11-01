import Link from "next/link";
import type { Person } from "@/db/schema";
import { Avatar } from "./Avatar";
import { BottomNav } from "./BottomNav";

export function Shell({ viewer, title, children, action }: { viewer: Person; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
          <h1 className="truncate text-lg font-bold">{title}</h1>
          <div className="flex items-center gap-2">
            {action}
            <Link href="/who" className="flex items-center gap-2 rounded-full border border-line bg-card py-1 pl-1 pr-3 text-xs font-medium text-muted hover:text-foreground" title="Switch user">
              <Avatar name={viewer.name} color={viewer.color} size={24} />
              {viewer.name}
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
