import Link from "next/link";

/** Simple centered page for screens outside the household shell (sign in, legal, welcome). */
export function Plain({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-background/90">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="inline-block h-6 w-6 rounded-lg bg-accent" aria-hidden /> Surprise Stash
          </Link>
        </div>
      </header>
      <main className={`mx-auto w-full flex-1 px-4 pb-12 pt-6 ${wide ? "max-w-2xl" : "max-w-md"}`}>{children}</main>
    </div>
  );
}
