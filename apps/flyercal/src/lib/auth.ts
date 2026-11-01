import { and, count, eq, gt, isNull } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { families, familyUsers, loginCodes, sessions, users, type Family, type User } from "@/db/schema";
import { generateLoginCode, generateToken, sha256 } from "./codes";
import { emailEnabled, sendLoginCodeEmail } from "./email";

export const SESSION_COOKIE = "session";
const CODE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_CODE_REQUESTS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;

export class AuthError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function normalizeEmail(input: string): string {
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new AuthError("Enter a valid email address.");
  return email;
}

function isReviewer(email: string) {
  const re = process.env.REVIEW_EMAIL?.trim().toLowerCase();
  return !!re && !!process.env.REVIEW_CODE && email === re;
}

export type RequestCodeResult = { sent: true } | { sent: false; devCode: string };

/** Create a 6-digit code and email it. Returns the code only when email is off (dev) or for the reviewer account. */
export async function requestCode(rawEmail: string): Promise<RequestCodeResult> {
  const email = normalizeEmail(rawEmail);
  if (isReviewer(email)) return { sent: true }; // reviewer uses the fixed REVIEW_CODE, nothing to send

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [recent] = await db
    .select({ n: count() })
    .from(loginCodes)
    .where(and(eq(loginCodes.email, email), gt(loginCodes.createdAt, hourAgo)));
  if ((recent?.n ?? 0) >= MAX_CODE_REQUESTS_PER_HOUR) {
    throw new AuthError("Too many codes requested. Try again in an hour.", 429);
  }

  const code = generateLoginCode();
  const now = new Date();
  await db.insert(loginCodes).values({
    id: crypto.randomUUID(),
    email,
    codeHash: sha256(`${email}:${code}`),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
    attempts: 0,
    createdAt: now.toISOString(),
  });

  if (!emailEnabled()) return { sent: false, devCode: code };
  await sendLoginCodeEmail(email, code);
  return { sent: true };
}

/** Check the code, create user/session, set the cookie. Returns the user. */
export async function verifyCode(rawEmail: string, rawCode: string): Promise<User> {
  const email = normalizeEmail(rawEmail);
  const code = rawCode.replace(/\D/g, "");
  if (code.length !== 6) throw new AuthError("Enter the 6-digit code.");

  if (isReviewer(email)) {
    if (code !== process.env.REVIEW_CODE) throw new AuthError("That code is not right.");
  } else {
    const nowIso = new Date().toISOString();
    const candidate = await db.query.loginCodes.findFirst({
      where: and(eq(loginCodes.email, email), isNull(loginCodes.consumedAt), gt(loginCodes.expiresAt, nowIso)),
      orderBy: (c, { desc }) => [desc(c.createdAt)],
    });
    if (!candidate) throw new AuthError("That code has expired. Request a new one.");
    if (candidate.codeHash !== sha256(`${email}:${code}`)) {
      const attempts = candidate.attempts + 1;
      await db
        .update(loginCodes)
        .set({ attempts, ...(attempts >= MAX_ATTEMPTS ? { consumedAt: nowIso } : {}) })
        .where(eq(loginCodes.id, candidate.id));
      throw new AuthError(attempts >= MAX_ATTEMPTS ? "Too many wrong tries. Request a new code." : "That code is not right.");
    }
    await db.update(loginCodes).set({ consumedAt: nowIso }).where(eq(loginCodes.id, candidate.id));
  }

  const user = await upsertUser(email);
  await createSession(user.id);
  return user;
}

async function upsertUser(email: string): Promise<User> {
  const now = new Date().toISOString();
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    await db.update(users).set({ lastLoginAt: now }).where(eq(users.id, existing.id));
    return { ...existing, lastLoginAt: now };
  }
  const id = crypto.randomUUID();
  await db.insert(users).values({ id, email, createdAt: now, lastLoginAt: now });
  return (await db.query.users.findFirst({ where: eq(users.id, id) }))!;
}

async function createSession(userId: string) {
  const token = generateToken();
  const now = Date.now();
  const h = await headers();
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    token,
    userId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
    userAgent: h.get("user-agent")?.slice(0, 200) ?? null,
  });
  (await cookies()).set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export type SessionInfo = { user: User; family: Family | null; role: "owner" | "member" | null };

/** The signed-in user and their family (if any), or null. */
export async function getSession(): Promise<SessionInfo | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.query.sessions.findFirst({ where: eq(sessions.token, token) });
  if (!session || session.expiresAt < new Date().toISOString()) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, session.userId) });
  if (!user) return null;
  const link = await db.query.familyUsers.findFirst({ where: eq(familyUsers.userId, user.id) });
  const family = link ? ((await db.query.families.findFirst({ where: eq(families.id, link.familyId) })) ?? null) : null;
  return { user, family, role: link?.role ?? null };
}

export async function requireUser(): Promise<SessionInfo> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function requireFamily(): Promise<SessionInfo & { family: Family }> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (!s.family) redirect("/welcome");
  return { ...s, family: s.family };
}

export async function signOut() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.token, token));
  store.set({ name: SESSION_COOKIE, value: "", path: "/", maxAge: 0 });
}
