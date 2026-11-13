import { getSession } from "@/lib/auth";
import { readBody } from "@/lib/http";
import { canCapture } from "@/lib/plans";
import { runCapture } from "@/lib/capture";

/** JSON twin of the Capture form: parse a note into ideas (never the caller's own), metered on free. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  if (!session.household || !session.person) return Response.json({ error: "Create or join a household first" }, { status: 403 });
  const body = await readBody(req);
  const text = String(body.text ?? "").trim();
  if (!text) return Response.json({ error: "Send some text" }, { status: 400 });
  const allowance = await canCapture(session.household);
  if (!allowance.ok) return Response.json({ error: "Free captures used up for this month", code: "limit_reached", used: allowance.used, limit: allowance.limit }, { status: 402 });
  try {
    const result = await runCapture({ household: session.household, viewer: session.person, text });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Could not parse that note" }, { status: 500 });
  }
}
