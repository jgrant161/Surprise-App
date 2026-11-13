import { getSession } from "@/lib/auth";
import { createHousehold, HouseholdError } from "@/lib/households";
import { readBody } from "@/lib/http";

/** Create a household for the signed-in user; they become owner and get their own person row. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const body = await readBody(req);
  try {
    const { household, person } = await createHousehold(session.user.id, String(body.name ?? ""), String(body.yourName ?? ""));
    return Response.json({ ok: true, householdId: household.id, inviteCode: household.inviteCode, personId: person.id });
  } catch (err) {
    if (err instanceof HouseholdError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Could not create the household." }, { status: 500 });
  }
}
