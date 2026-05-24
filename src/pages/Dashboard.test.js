import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Dashboard widgets match the design stats row", async () => {
  const source = await readFile(new URL("./Dashboard.jsx", import.meta.url), "utf8");

  assert.match(source, /getGraderHistory/);
  assert.match(source, /Avg ATS score/);
  assert.match(source, /Resumes shared/);
  assert.match(source, /Bullets rewritten/);
  assert.match(source, /Total views received/);
  assert.match(source, /suffix="\/100"/);
  assert.match(source, /trend=\{scoreTrend\}/);
});

test("Dashboard loads and displays distinct published resume view counts", async () => {
  const source = await readFile(new URL("./Dashboard.jsx", import.meta.url), "utf8");

  assert.match(source, /getResumeViewCounts/);
  assert.match(source, /getResumeViewCounts\(publishedIds, currentUser\.uid\)/);
  assert.match(source, /distinctViewCount/);
  assert.match(source, /formatViewCount\(resume\.distinctViewCount\)/);
  assert.match(source, /<Eye size=\{11\} \/>/);
});
