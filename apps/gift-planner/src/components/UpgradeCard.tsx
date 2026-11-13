import Link from "next/link";

export function UpgradeCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="card border-accent bg-accent-soft/60 text-center">
      <p className="text-3xl">✨</p>
      <h2 className="mt-2 text-lg font-bold">{title}</h2>
      <p className="mt-1 text-sm text-muted">{body}</p>
      <Link href="/upgrade" className="btn-primary mt-4">See Surprise Stash Pro</Link>
    </div>
  );
}
