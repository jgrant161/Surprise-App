import { AuthError, verifyCode } from "@/lib/auth";
import { getSession } from "@/lib/auth";
import { readBody } from "@/lib/http";

/** Verifies the emailed code and sets the session cookie. Response says whether the user still needs to pick a family. */
export async function POST(req: Request) {
  const body = await readBody(req);
  try {
    const user = await verifyCode(String(body.email ?? ""), String(body.code ?? ""));
    const session = await getSession();
    return Response.json({ ok: true, userId: user.id, email: user.email, hasFamily: !!session?.family, next: session?.family ? "/" : "/welcome" });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Sign-in failed. Try again." }, { status: 500 });
  }
}
