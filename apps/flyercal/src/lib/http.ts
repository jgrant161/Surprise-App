/** Read a JSON or form-encoded request body as a plain object. */
export async function readBody(req: Request): Promise<Record<string, unknown>> {
  const type = req.headers.get("content-type") ?? "";
  if (type.includes("application/json")) return (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const form = await req.formData().catch(() => null);
  return form ? Object.fromEntries(form.entries()) : {};
}

import { headers } from "next/headers";

/** Public base URL of this deployment, for links that leave the app (calendar feeds, invites). */
export async function appBaseUrl(): Promise<string> {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
