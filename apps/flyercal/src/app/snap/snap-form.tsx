"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "photo" | "text";

async function resizeImage(file: File, maxEdge = 1600, quality = 0.85): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality),
  );
}

export function SnapForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("photo");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  async function submit(form: FormData) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/snaps", { method: "POST", body: form });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Upload failed");
      router.push(`/snaps/${data.id}/review`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  async function onPhotoSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Choose or take a photo first.");
    const blob = await resizeImage(file);
    const form = new FormData();
    form.set("image", blob, "snap.jpg");
    form.set("sourceLabel", file.name);
    await submit(form);
  }

  async function onTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return setError("Paste some text first.");
    const form = new FormData();
    form.set("text", text);
    await submit(form);
  }

  function onPick(f: File | null) {
    setFile(f);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  return (
    <div className="card">
      <div className="mb-4 grid grid-cols-2 rounded-lg bg-border/50 p-1 text-sm font-medium">
        {(["photo", "text"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md py-1.5 ${tab === t ? "bg-card shadow" : "text-muted"}`}
          >
            {t === "photo" ? "📷 Photo" : "📝 Paste text"}
          </button>
        ))}
      </div>

      {tab === "photo" ? (
        <form onSubmit={onPhotoSubmit} className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          {preview ? (
            <button type="button" onClick={() => fileRef.current?.click()} className="block w-full overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Selected schedule" className="max-h-80 w-full object-contain bg-black/5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-12 text-muted hover:border-accent hover:text-accent"
            >
              <span className="text-4xl">📷</span>
              <span className="text-sm font-medium">Take a photo or choose one</span>
              <span className="text-xs">Resized on your phone before upload</span>
            </button>
          )}
          <button type="submit" disabled={busy || !file} className="btn-primary w-full">
            {busy ? "Reading the schedule…" : "Extract events"}
          </button>
        </form>
      ) : (
        <form onSubmit={onTextSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder={"Paste the email, newsletter or group-chat message here…\n\ne.g. “Practice is Tuesdays 5:30–6:30 at Riverside through Nov 12. Bring water!”"}
            className="input"
          />
          <button type="submit" disabled={busy || !text.trim()} className="btn-primary w-full">
            {busy ? "Reading the text…" : "Extract events"}
          </button>
        </form>
      )}

      {busy && <p className="mt-3 text-center text-sm text-muted">This usually takes 10–20 seconds.</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">{error}</p>}
    </div>
  );
}
