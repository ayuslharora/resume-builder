import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("improveResume prompt includes source document context when provided", () => {
  const groqSource = readFileSync(new URL("../../api/groqTasks.js", import.meta.url), "utf8");

  assert.match(groqSource, /Candidate's raw background\/source document/);
  assert.match(groqSource, /sourceDocumentText/);
});

test("rewriteResumeBullet prompt includes source document context when provided", () => {
  const groqSource = readFileSync(new URL("../../api/groqTasks.js", import.meta.url), "utf8");

  assert.match(groqSource, /Relevant source document context/);
  assert.match(groqSource, /sourceDocumentText/);
});

test("grader improve flow forwards the uploaded source document to improveResume", () => {
  const graderSource = readFileSync(new URL("../pages/Grader.jsx", import.meta.url), "utf8");

  assert.match(graderSource, /sourceDocumentText:\s*result\.resumeText/);
});

test("builder bullet rewrite flow forwards brag sheet text as source document context", () => {
  const editStepSource = readFileSync(new URL("../components/builder/EditStep.jsx", import.meta.url), "utf8");

  assert.match(editStepSource, /sourceDocumentText:\s*bragSheetText/);
});
