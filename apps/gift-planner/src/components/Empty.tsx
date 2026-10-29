export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="card text-center">
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
