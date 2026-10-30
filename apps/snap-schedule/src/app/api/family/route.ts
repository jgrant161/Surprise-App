import { getSession } from "@/lib/auth";
import { createFamily, FamilyError } from "@/lib/families";
import { readBody } from "@/lib/http";

/** Create a family for the signed-in user (they become owner). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const body = await readBody(req);
  try {
    const family = await createFamily(session.user.id, String(body.name ?? ""), String(body.timezone ?? ""));
    return Response.json({ ok: true, familyId: family.id, inviteCode: family.inviteCode });
  } catch (err) {
    if (err instanceof FamilyError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Could not create the family." }, { status: 500 });
  }
}
