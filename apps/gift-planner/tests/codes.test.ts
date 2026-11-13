import { test } from "node:test";
import assert from "node:assert/strict";
import { INVITE_ALPHABET, generateInviteCode, generateLoginCode, generateToken, isValidInviteCode, normalizeInviteCode } from "../src/lib/codes";

test("invite codes are 8 chars from the unambiguous alphabet", () => {
  for (let i = 0; i < 200; i++) {
    const c = generateInviteCode();
    assert.equal(c.length, 8);
    for (const ch of c) assert.ok(INVITE_ALPHABET.includes(ch), `bad char ${ch}`);
    assert.ok(isValidInviteCode(c));
  }
  for (const banned of "0O1IL") assert.ok(!INVITE_ALPHABET.includes(banned), `${banned} should not be in the alphabet`);
});

test("typed invite codes are normalised", () => {
  assert.equal(normalizeInviteCode(" abcd-2345 "), "ABCD2345");
  assert.equal(normalizeInviteCode("abcd 2345 extra"), "ABCD2345");
  assert.equal(isValidInviteCode(normalizeInviteCode("abc0efgh")), false);
});

test("login codes are six digits and tokens are 64 hex chars", () => {
  for (let i = 0; i < 50; i++) assert.match(generateLoginCode(), /^\d{6}$/);
  assert.match(generateToken(), /^[a-f0-9]{64}$/);
});
