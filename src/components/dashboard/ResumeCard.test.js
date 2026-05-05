import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("ResumeCard exposes an inline title editor that saves through Firestore", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");

  assert.match(source, /isEditingTitle/);
  assert.match(source, /draftTitle/);
  assert.match(source, /handleSaveTitle/);
  assert.match(source, /buildResumeTitleUpdate/);
  assert.match(source, /updateResume\(resume\.id, buildResumeTitleUpdate\(draftTitle\)\)/);
  assert.match(source, /Rename resume title/);
  assert.match(source, /Save resume title/);
  assert.match(source, /Cancel title edit/);
});
