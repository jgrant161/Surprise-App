import { test } from "node:test";
import assert from "node:assert/strict";
import { hideSelf, isSelf, assertNotSelf, NoPeekingError } from "../src/lib/visibility";

const rows = [
  { id: "a", forPersonId: "mom" },
  { id: "b", forPersonId: "dad" },
  { id: "c", forPersonId: "mom" },
  { id: "d", forPersonId: "ava" },
];

test("hideSelf drops every row meant for the viewer and keeps the rest in order", () => {
  assert.deepEqual(hideSelf("mom", rows).map((r) => r.id), ["b", "d"]);
  assert.deepEqual(hideSelf("ava", rows).map((r) => r.id), ["a", "b", "c"]);
  assert.deepEqual(hideSelf("nobody", rows).map((r) => r.id), ["a", "b", "c", "d"]);
});

test("isSelf and assertNotSelf agree", () => {
  assert.equal(isSelf("mom", "mom"), true);
  assert.equal(isSelf("mom", "dad"), false);
  assert.doesNotThrow(() => assertNotSelf("mom", "dad"));
  assert.throws(() => assertNotSelf("mom", "mom"), NoPeekingError);
});
