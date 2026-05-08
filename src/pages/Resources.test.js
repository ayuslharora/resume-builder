import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Resources page uses the current app design vocabulary", async () => {
  const source = await readFile(new URL("./Resources.jsx", import.meta.url), "utf8");

  assert.match(source, /app-page/);
  assert.match(source, /h-display/);
  assert.match(source, /panel/);
  assert.match(source, /pill/);
  assert.doesNotMatch(source, /glassCard/);
  assert.doesNotMatch(source, /rgba\(25,\s*31,\s*49/);
});

test("Resources writing desk widget is sized as a compact badge", async () => {
  const source = await readFile(new URL("./Resources.jsx", import.meta.url), "utf8");

  assert.match(source, /aria-label="Writing desk resource type"/);
  assert.match(source, /inline-flex/);
  assert.match(source, /whitespace-nowrap/);
  assert.doesNotMatch(source, /max-w-\[260px\]/);
});
