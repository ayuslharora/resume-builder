import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("InlineEdit sanitizes resume HTML before rendering, syncing, saving, and AI rewrites", async () => {
  const source = await readFile(new URL("./InlineEdit.jsx", import.meta.url), "utf8");

  assert.match(source, /sanitizeResumeHtml/);
  assert.match(source, /stripResumeHtml/);
  assert.match(source, /const sanitizedValue = sanitizeResumeHtml\(value\)/);
  assert.match(source, /dangerouslySetInnerHTML=\{\{ __html: sanitizedValue \}\}/);
  assert.match(source, /const newValue = sanitizeResumeHtml\(contentEditableRef\.current\.innerHTML\)/);
  assert.match(source, /stripResumeHtml\(newValue\)\.trim\(\) === ""/);
  assert.match(source, /onAiRewrite\(stripResumeHtml\(contentEditableRef\.current\?\.innerHTML \|\| value \|\| ""\)\)/);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML=\{\{ __html: value/);
  assert.doesNotMatch(source, /onChange\(contentEditableRef\.current\.innerHTML\)/);
});
