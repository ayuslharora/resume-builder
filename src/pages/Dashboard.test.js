import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Dashboard widgets match the design stats row", async () => {
  const source = await readFile(new URL("./Dashboard.jsx", import.meta.url), "utf8");

  assert.match(source, /getGraderHistory/);
  assert.match(source, /Avg ATS score/);
  assert.match(source, /Resumes shared/);
  assert.match(source, /Bullets rewritten/);
  assert.match(source, /Last graded/);
  assert.match(source, /suffix="\/100"/);
  assert.match(source, /trend=\{scoreTrend\}/);
});
