import { AuthError, requestCode } from "@/lib/auth";
import { readBody } from "@/lib/http";

export async function POST(req: Request) {
  const body = await readBody(req);
  try {
    const result = await requestCode(String(body.email ?? ""));
    return Response.json(result.sent ? { ok: true, sent: true } : { ok: true, sent: false, devCode: result.devCode });
  } catch (err) {
    if (err instanceof AuthError) return Response.json({ error: err.message }, { status: err.status });
    console.error(err);
    return Response.json({ error: "Could not send a code right now. Try again in a minute." }, { status: 500 });
  }
}
