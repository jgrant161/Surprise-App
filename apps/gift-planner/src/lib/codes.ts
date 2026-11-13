import { createHash, randomBytes, randomInt } from "node:crypto";

/** Uppercase letters and digits minus the ones people confuse (0/O, 1/I/L). */
export const INVITE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const INVITE_LENGTH = 8;

export function generateInviteCode(): string {
  let out = "";
  for (let i = 0; i < INVITE_LENGTH; i++) out += INVITE_ALPHABET[randomInt(INVITE_ALPHABET.length)];
  return out;
}

/** Normalise what a user typed: uppercase, drop spaces and dashes. */
export function normalizeInviteCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, INVITE_LENGTH);
}

export function isValidInviteCode(code: string): boolean {
  return code.length === INVITE_LENGTH && [...code].every((c) => INVITE_ALPHABET.includes(c));
}

/** Six digits, crypto random, zero-padded. */
export function generateLoginCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** 32 random bytes as hex (64 chars). */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
