import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("EditStep exposes an ATS rescan trigger in the editor toolbar", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");
  assert.match(source, /Re-scan/);
  assert.match(source, /btn-ghost h-10 w-full !border-\[#d4d4d8\] sm:w-auto/);
});

test("EditStep keeps re-scan and render controls in the action row", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /btn-ghost h-10 w-full !border-\[#d4d4d8\] sm:w-auto/);
  assert.match(source, /className="btn-primary h-10[\s\S]*Render/);
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
  assert.doesNotMatch(source, /bg-cyan-400|text-cyan-400|text-cyan-500|bg-cyan-500|border-cyan-500|rgba\(34,211,238|rgba\(6,\s*182,\s*212,\s*0\.15\)/);
  assert.doesNotMatch(source, /background:\s*"#ffffff"|backgroundColor:\s*"#f4f4f5"|bg-\[#eff6ff\]|text-blue-600|bg-\[#2563eb\]|hover:bg-\[#f4f4f5\]/);
});

test("EditStep keeps the render export action in step 5", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /Render/);
  assert.match(source, /navigate\(`\/export\/\$\{exportResumeId\}`/);
  assert.match(source, /Play size=\{14\}/);
});

test("EditStep saves the complete current resume payload before exporting", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");
  const shortcut = source.slice(
    source.indexOf('useKeyboardShortcut("p"'),
    source.indexOf('useKeyboardShortcut("g"')
  );
  const handler = source.slice(
    source.indexOf("async function handleCompleteRendering"),
    source.indexOf("useKeyboardShortcut(\"g\"")
  );

  assert.match(source, /function buildCompleteResumeSavePayload\(\) \{/);
  assert.match(handler, /const completeResumePayload = buildCompleteResumeSavePayload\(\)/);
  assert.match(handler, /await saveNow\(completeResumePayload\)/);
  assert.match(handler, /builderData:\s*\{\s*\.\.\.builderData,\s*\.\.\.completeResumePayload\s*\}/);
  assert.match(shortcut, /handleCompleteRendering\(\)/);
  assert.match(source, /onClick=\{handleCompleteRendering\}[\s\S]*Render/);
  assert.doesNotMatch(shortcut, /saveNow\(\{\s*status:\s*"complete"\s*\}\)/);
});

test("EditStep persists bullet edits before the final render fetches from Firestore", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");
  const bulletUpdateHandler = source.slice(
    source.indexOf("const handleUpdateBullet"),
    source.indexOf("const handleAddBullet")
  );
  const bulletRewriteHandler = source.slice(
    source.indexOf("const handleApplyBulletRewrite"),
    source.indexOf("const handleUpdateBullet")
  );

  assert.match(bulletUpdateHandler, /saveToFirestore\(\{\s*resumeData:\s*\{\s*\.\.\.resumeData,\s*\[sectionName\]:\s*updatedSection\s*\}\s*\}\)/);
  assert.match(bulletRewriteHandler, /saveToFirestore\(\{\s*resumeData:\s*\{\s*\.\.\.resumeData,\s*\[sectionName\]:\s*updatedSection\s*\}\s*\}\)/);
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

test("EditStep exposes compact font controls beside rich text tools", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /<RichTextToolbar flat \/>/);
  assert.match(source, /h-5 w-px bg-surface-container-high/);
  assert.match(source, /aria-label="Resume font family"/);
  assert.match(source, /aria-label="Decrease font size"/);
  assert.match(source, /aria-label="Increase font size"/);
  assert.match(source, /POPULAR_RESUME_FONTS\.map/);
});

test("EditStep persists typography changes to theme in resumeData", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /const handleTypographyChange = \(field, value\) => \{/);
  assert.match(source, /updateSection\("theme", nextTheme\)/);
  assert.match(source, /theme: nextTheme/);
  assert.match(source, /\.\.\.previewTypographyStyle/);
});
