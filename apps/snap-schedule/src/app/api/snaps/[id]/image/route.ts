import { eq } from "drizzle-orm";
import { db } from "@/db";
import { snaps } from "@/db/schema";

export async function GET(_req: Request, ctx: RouteContext<"/api/snaps/[id]/image">) {
  const { id } = await ctx.params;
  const snap = await db.query.snaps.findFirst({ where: eq(snaps.id, id) });
  if (!snap?.image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(snap.image), {
    headers: {
      "Content-Type": snap.imageMime ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
