import { NextRequest } from "next/server";
import { db } from "@/db";
import { snaps } from "@/db/schema";
import { getFamily, getMembers } from "@/db/queries";
import { processSnap } from "@/lib/snaps";
import { eq } from "drizzle-orm";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "Expected multipart form data" }, { status: 400 });
  }
  const image = form.get("image");
  const text = form.get("text");
  const sourceLabel = form.get("sourceLabel");

  const family = await getFamily();
  const members = await getMembers(family.id);
  const id = crypto.randomUUID();

  if (image instanceof File && image.size > 0) {
    if (image.size > 8 * 1024 * 1024) return Response.json({ error: "Image is too large (8MB max)" }, { status: 413 });
    const mime = image.type || "image/jpeg";
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) {
      return Response.json({ error: "Use a JPEG, PNG, WebP or GIF image" }, { status: 415 });
    }
    await db.insert(snaps).values({
      id,
      familyId: family.id,
      kind: "image",
      imageMime: mime,
      image: Buffer.from(await image.arrayBuffer()),
      sourceLabel: typeof sourceLabel === "string" && sourceLabel ? sourceLabel : "Photo",
      status: "processing",
      createdAt: new Date().toISOString(),
    });
  } else if (typeof text === "string" && text.trim()) {
    if (text.length > 20000) return Response.json({ error: "Text is too long (20,000 characters max)" }, { status: 413 });
    await db.insert(snaps).values({
      id,
      familyId: family.id,
      kind: "text",
      text,
      sourceLabel: text.trim().split("\n")[0].slice(0, 60),
      status: "processing",
      createdAt: new Date().toISOString(),
    });
  } else {
    return Response.json({ error: "Send an image or some text" }, { status: 400 });
  }

  const snap = (await db.query.snaps.findFirst({ where: eq(snaps.id, id) }))!;
  const result = await processSnap(snap, family, members);
  return Response.json({ id, ...result });
}
