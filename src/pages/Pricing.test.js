import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Pricing headline uses an oversized display scale", async () => {
  const source = await readFile(new URL("./Pricing.jsx", import.meta.url), "utf8");

  assert.match(source, /Fu\*k pricing/);
  assert.match(source, /fontSize:\s*"clamp\(64px, 8vw, 104px\)"/);
});
