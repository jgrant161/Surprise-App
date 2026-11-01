import { getSnapWithImage } from "@/db/queries";
import { getSession } from "@/lib/auth";

export async function GET(_req: Request, ctx: RouteContext<"/api/snaps/[id]/image">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session?.family) return new Response("Not found", { status: 404 });
  const snap = await getSnapWithImage(session.family.id, id);
  if (!snap?.image) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(snap.image), {
    headers: {
      "Content-Type": snap.imageMime ?? "image/jpeg",
      "Cache-Control": "private, max-age=300",
    },
  });
}
