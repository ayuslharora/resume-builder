import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("EditStep exposes an ATS rescan trigger in the editor toolbar", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");
  assert.match(source, /Re-scan/);
  assert.match(source, /btn-ghost h-10 w-full !border-\[#d4d4d8\] sm:w-auto/);
});

test("EditStep keeps re-scan and complete rendering controls at the same height", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /btn-ghost h-10 w-full !border-\[#d4d4d8\] sm:w-auto/);
  assert.match(source, /className="btn-primary h-10[\s\S]*Complete Rendering/);
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

test("EditStep live preview keeps its layout but uses theme-aware builder tokens", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /builder-live-preview/);
  assert.match(source, /builder-live-preview-toolbar/);
  assert.match(source, /background:\s*"var\(--builder-form-surface\)"/);
  assert.match(source, /border:\s*"1px solid var\(--builder-form-border-soft\)"/);
  assert.match(source, /backgroundColor:\s*"var\(--builder-form-surface-muted\)"/);
  assert.match(source, /background:\s*"var\(--accent\)"/);
  assert.match(source, /background:\s*"var\(--accent-soft\)"/);
  assert.match(source, /text-primary/);
  assert.match(source, /bg-primary\/5/);
  assert.doesNotMatch(source, /bg-cyan-400|text-cyan-400|text-cyan-500|bg-cyan-500|border-cyan-500|rgba\(34,211,238|rgba\(6,\s*182,\s*212,\s*0\.15\)/);
  assert.doesNotMatch(source, /background:\s*"#ffffff"|backgroundColor:\s*"#f4f4f5"|bg-\[#eff6ff\]|text-blue-600|bg-\[#2563eb\]|hover:bg-\[#f4f4f5\]/);
});

test("EditStep keeps the complete rendering export action in step 5", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /Complete Rendering/);
  assert.match(source, /navigate\(`\/export\/\$\{activeResumeId\}`/);
  assert.match(source, /FileText size=\{14\}/);
});

test("EditStep ATS panel uses the new app design theme instead of legacy dark glass", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /app-design ats-feedback-panel/);
  assert.match(source, /ats-feedback-card/);
  assert.match(source, /scorebar/);
  assert.match(source, /var\(--accent\)/);
  assert.doesNotMatch(source, /glass-card ghost-border/);
  assert.doesNotMatch(source, /rgba\(7,13,31,0\.45\)/);
  assert.doesNotMatch(source, /linear-gradient\(90deg, #06b6d4 0%, #67e8f9 100%\)/);
});
