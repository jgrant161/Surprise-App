import { getSession } from "@/lib/auth";
import { FamilyError, joinFamily } from "@/lib/families";
import { readBody } from "@/lib/http";

/** Join an existing family with its invite code. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const body = await readBody(req);
  try {
    const family = await joinFamily(session.user.id, String(body.code ?? ""));
    return Response.json({ ok: true, familyId: family.id, name: family.name });
  } catch (err) {
    if (err instanceof FamilyError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Could not join the family." }, { status: 500 });
  }
}
