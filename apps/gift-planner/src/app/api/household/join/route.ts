import { getSession } from "@/lib/auth";
import { HouseholdError, joinHousehold } from "@/lib/households";
import { readBody } from "@/lib/http";

/** Join with an invite code as an existing person (personId) or a new one (yourName). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const body = await readBody(req);
  try {
    const { household, person } = await joinHousehold(session.user.id, String(body.code ?? ""), {
      personId: typeof body.personId === "string" && body.personId ? body.personId : null,
      yourName: typeof body.yourName === "string" ? body.yourName : null,
    });
    return Response.json({ ok: true, householdId: household.id, name: household.name, personId: person.id });
  } catch (err) {
    if (err instanceof HouseholdError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Could not join the household." }, { status: 500 });
  }
}
