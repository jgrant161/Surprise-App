import { getSession } from "@/lib/auth";
import { HouseholdError, lookupInvite } from "@/lib/households";
import { readBody } from "@/lib/http";

/** Preview an invite code: household name plus the people a joiner could sign in as. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const body = await readBody(req);
  try {
    const { household, claimable } = await lookupInvite(String(body.code ?? ""));
    return Response.json({ ok: true, name: household.name, people: claimable });
  } catch (err) {
    if (err instanceof HouseholdError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Could not look up that code." }, { status: 500 });
  }
}
