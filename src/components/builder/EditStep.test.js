import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("EditStep exposes an ATS rescan trigger in the editor toolbar", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");
  assert.match(source, /Re-scan/);
});

test("EditStep uses a mobile overlay ATS panel and a scrollable preview rail", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /fixed inset-x-3 top-\[5\.5rem\] bottom-\[calc\(7rem\+env\(safe-area-inset-bottom\)\)\] z-40 lg:static/);
  assert.match(source, /overflow-x-auto lg:overflow-x-hidden/);
  assert.match(source, /Math\.min\(0\.72, Math\.max\(0\.52, newScale\)\)/);
  assert.match(source, /const scaledPreviewWidth = 794 \* previewScale/);
  assert.match(source, /transform: isMobilePreview \? `scale\(\$\{previewScale\}\)` : undefined/);
  assert.match(source, /width: isMobilePreview \? `\$\{scaledPreviewWidth\}px` : "794px"/);
});
