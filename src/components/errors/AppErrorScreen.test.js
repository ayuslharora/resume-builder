import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("AppErrorScreen uses the current app design styling", async () => {
  const source = await readFile(new URL("./AppErrorScreen.jsx", import.meta.url), "utf8");

  assert.match(source, /app-design/);
  assert.match(source, /panel/);
  assert.match(source, /btn btn-accent/);
  assert.match(source, /btn btn-outline/);
  assert.match(source, /var\(--bad-soft\)/);
  assert.doesNotMatch(source, /glass-strong/);
  assert.doesNotMatch(source, /orb w-\[/);
  assert.doesNotMatch(source, /shadow-glass/);
  assert.doesNotMatch(source, /bg-cyan|bg-purple|text-red-300/);
});
