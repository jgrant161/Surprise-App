/** Transactional email through Resend's REST API. No SDK needed for one endpoint. */

export const APP_NAME = "Snap Schedule";

export function emailEnabled() {
  return !!process.env.RESEND_API_KEY;
}

export async function sendLoginCodeEmail(to: string, code: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Email sending is not configured");
  const from = process.env.EMAIL_FROM || "Snap Schedule <login@snapschedule.app>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `${code} is your ${APP_NAME} sign-in code`,
      text: `Your ${APP_NAME} sign-in code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
      html: `<p>Your ${APP_NAME} sign-in code is</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${body.slice(0, 200)}`);
  }
}
