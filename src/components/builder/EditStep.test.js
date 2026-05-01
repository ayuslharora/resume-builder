import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("EditStep exposes an ATS rescan trigger in the editor toolbar", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");
  assert.match(source, /Re-scan/);
});
