import { test } from "node:test";
import assert from "node:assert/strict";
import { affiliateUrl, hostLabel } from "../src/lib/affiliate";

test("amazon links get the tag added or replaced; others untouched; bad input returned as is", () => {
  const prev = process.env.AMAZON_ASSOCIATES_TAG;
  process.env.AMAZON_ASSOCIATES_TAG = "stash-20";
  try {
    assert.equal(new URL(affiliateUrl("https://www.amazon.com/dp/B07C4VNXHQ")).searchParams.get("tag"), "stash-20");
    assert.equal(new URL(affiliateUrl("https://amazon.co.uk/dp/X?tag=someoneelse-21")).searchParams.get("tag"), "stash-20");
    assert.equal(affiliateUrl("https://www.target.com/p/123"), "https://www.target.com/p/123");
    assert.equal(affiliateUrl("not a url"), "not a url");
  } finally {
    if (prev === undefined) delete process.env.AMAZON_ASSOCIATES_TAG;
    else process.env.AMAZON_ASSOCIATES_TAG = prev;
  }
});

test("without a tag configured amazon links pass through", () => {
  const prev = process.env.AMAZON_ASSOCIATES_TAG;
  delete process.env.AMAZON_ASSOCIATES_TAG;
  try {
    assert.equal(new URL(affiliateUrl("https://www.amazon.com/dp/B07C4VNXHQ")).searchParams.get("tag"), null);
  } finally {
    if (prev !== undefined) process.env.AMAZON_ASSOCIATES_TAG = prev;
  }
});

test("hostLabel strips www and tolerates junk", () => {
  assert.equal(hostLabel("https://www.amazon.com/dp/1"), "amazon.com");
  assert.equal(hostLabel("junk"), null);
  assert.equal(hostLabel(null), null);
});
