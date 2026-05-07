import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Grader offers upload, pasted text, and ResuMe link grading options", async () => {
  const source = await readFile(new URL("./Grader.jsx", import.meta.url), "utf8");

  assert.match(source, /Select Resume Document/);
  assert.match(source, /Paste Resume Text/);
  assert.match(source, /Paste ResuMe Link/);
  assert.match(source, /getResumeByShareToken/);
  assert.match(source, /buildSharedResumeGradeSource/);
});
