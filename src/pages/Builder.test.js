import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Builder shows a sticky back button while step 4 is active", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /currentStep >= 4[\s\S]*?<button onClick=\{prevStep\}[\s\S]*Back/
  );
});

test("Builder keeps the sticky back button visible through step 5", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /currentStep >= 4[\s\S]*?<button onClick=\{prevStep\}[\s\S]*Back/
  );
});

test("Builder stacks its mobile sticky header without changing desktop layout", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(source, /flex-col gap-3 lg:flex-row lg:items-center/);
  assert.match(source, /w-full lg:flex-1 lg:min-w-0/);
});

test("Builder reserves mobile bottom space for step actions above the bottom nav", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /pb-\[calc\(8\.5rem\+env\(safe-area-inset-bottom\)\)\] lg:pb-20/
  );
});

test("StepIndicator has a compact mobile progress mode", async () => {
  const source = await readFile(
    new URL("../components/builder/StepIndicator.jsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /lg:hidden/);
  assert.match(source, /hidden lg:flex/);
  assert.match(source, /Step \{currentStep\} of \{steps.length\}/);
});

test("StepIndicator preserves the old timeline shape with the new blue theme", async () => {
  const source = await readFile(
    new URL("../components/builder/StepIndicator.jsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /Config[\s\S]*Upload[\s\S]*Design[\s\S]*Refine[\s\S]*Export/);
  assert.doesNotMatch(source, /Source|Editor/);
  assert.match(source, /hidden lg:flex w-full max-w-3xl mx-auto items-center justify-between relative/);
  assert.match(source, /builder-step-node/);
  assert.match(source, /isCompleted \? "✓" : stepNum/);
  assert.match(source, /#2563eb/);
  assert.doesNotMatch(source, /06b6d4|0891b2|rgba\(6,\s*182,\s*212|linear-gradient/);
});

test("Builder top timeline uses a refined capsule workflow style", async () => {
  const source = await readFile(
    new URL("../components/builder/StepIndicator.jsx", import.meta.url),
    "utf8"
  );
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");

  assert.match(source, /builder-step-timeline/);
  assert.match(source, /builder-step-rail/);
  assert.match(source, /builder-step-rail-fill/);
  assert.match(source, /builder-step-node/);
  assert.match(source, /builder-step-label/);
  assert.match(source, /data-state=\{isActive \? "active" : isCompleted \? "completed" : "upcoming"\}/);
  assert.match(source, /builder-step-chip/);
  assert.match(css, /\.builder-step-timeline\s*\{[\s\S]*border-radius:\s*18px/);
  assert.match(css, /\.builder-step-timeline\s*\{[\s\S]*var\(--builder-step-shell-bg\)/);
  assert.match(css, /\.builder-step-timeline\s*\{[\s\S]*backdrop-filter:\s*blur\(18px\)/);
  assert.match(css, /\.builder-step\s*\{[\s\S]*display:\s*grid/);
  assert.match(css, /\.builder-step-node\s*\{[\s\S]*border-radius:\s*999px/);
  assert.match(css, /\.builder-step\[data-state="active"\] \.builder-step-node\s*\{[\s\S]*box-shadow:/);
  assert.match(css, /\.builder-step\[data-state="completed"\] \.builder-step-node,[\s\S]*\.builder-step\[data-state="active"\] \.builder-step-node\s*\{[\s\S]*color:\s*var\(--accent-fg\)/);
  assert.doesNotMatch(css, /\.builder-step\[data-state="completed"\] \.builder-step-node,[\s\S]*\.builder-step\[data-state="active"\] \.builder-step-node\s*\{[\s\S]*color:\s*#ffffff/);
  assert.match(css, /\.builder-step-timeline\s*\{[\s\S]*inset 0 1px 0 var\(--builder-step-inset-highlight\)/);
  assert.match(css, /\.builder-step-node\s*\{[\s\S]*inset 0 1px 0 var\(--builder-step-node-highlight\)/);
  assert.match(css, /\.builder-step-chip\s*\{[\s\S]*inset 0 1px 0 var\(--builder-step-chip-highlight\)/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-topbar\.app-design\s*\{[\s\S]*--builder-step-inset-highlight:\s*rgba\(255, 255, 255, 0\.03\)/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-topbar\.app-design\s*\{[\s\S]*--builder-step-node-highlight:\s*rgba\(255, 255, 255, 0\.04\)/);
  assert.match(css, /\.builder-step-timeline\s*\{[\s\S]*box-shadow:/);
  assert.match(css, /\.builder-step-chip\s*\{[\s\S]*box-shadow:/);
});

test("Builder step cards and actions include mobile-safe layout classes", async () => {
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");
  const interview = await readFile(
    new URL("../components/builder/InterviewStep.jsx", import.meta.url),
    "utf8"
  );
  const upload = await readFile(
    new URL("../components/builder/UploadStep.jsx", import.meta.url),
    "utf8"
  );
  const template = await readFile(
    new URL("../components/builder/TemplateStep.jsx", import.meta.url),
    "utf8"
  );
  const generate = await readFile(
    new URL("../components/builder/GenerateStep.jsx", import.meta.url),
    "utf8"
  );

  assert.match(css, /rounded-xl p-4 sm:p-8 max-w-3xl mx-auto mt-3 sm:mt-6/);
  assert.match(interview, /flex-col gap-3 sm:flex-row/);
  assert.match(upload, /flex-wrap/);
  assert.match(template, /flex-col gap-3 sm:flex-row/);
  assert.match(generate, /h-\[calc\(100dvh-250px\)\] lg:h-\[calc\(100dvh-190px\)\]/);
});

test("Builder form keeps its layout while primary buttons follow accent tokens", async () => {
  const builder = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");
  const upload = await readFile(
    new URL("../components/builder/UploadStep.jsx", import.meta.url),
    "utf8"
  );
  const builderPrimaryHoverBlock =
    css.match(/\.builder-form-theme \.btn-primary:hover:not\(:disabled\)\s*\{[^}]*\}/)?.[0] ?? "";

  assert.match(builder, /builder-form-theme/);
  assert.match(css, /\.builder-form-theme \.step-card\s*\{[\s\S]*background:\s*#ffffff/);
  assert.match(css, /\.builder-form-theme\s*\{[\s\S]*--accent:\s*#2563eb/);
  assert.match(css, /body\[data-accent="mono"\] \.builder-form-theme\s*\{[\s\S]*--accent:\s*#0a0a0b/);
  assert.match(css, /body\[data-theme="dark"\]\[data-accent="mono"\] \.builder-form-theme\s*\{[\s\S]*--accent:\s*#fafafa/);
  assert.match(css, /body\[data-theme="dark"\]\[data-accent="mono"\] \.builder-form-theme\s*\{[\s\S]*--accent-fg:\s*#0a0a0c/);
  assert.match(css, /\.builder-form-theme input:not\(\[type="radio"\]\):not\(\[type="checkbox"\]\):not\(\[type="file"\]\)/);
  assert.match(css, /\.builder-form-theme input\[type="radio"\]\s*\{[\s\S]*accent-color:\s*var\(--accent\)/);
  assert.match(css, /\.builder-form-theme \.btn-primary\s*\{[\s\S]*background:\s*var\(--accent\)/);
  assert.match(css, /\.builder-form-theme \.btn-primary\s*\{[\s\S]*color:\s*var\(--accent-fg\) !important/);
  assert.match(css, /\.builder-form-theme \.btn-primary :is\(svg, span, strong, em\)\s*\{[\s\S]*color:\s*inherit !important/);
  assert.match(builderPrimaryHoverBlock, /color:\s*var\(--accent-fg\) !important/);
  assert.doesNotMatch(builderPrimaryHoverBlock, /filter:/);
  assert.doesNotMatch(css, /\.builder-form-theme \.btn-primary\s*\{[\s\S]*background:\s*#2563eb/);
  assert.match(upload, /var\(--accent-soft\)/);
  assert.match(upload, /var\(--accent\)/);
  assert.match(upload, /var\(--builder-form-surface\)/);
  assert.doesNotMatch(upload, /rgba\(25,31,49|rgba\(7,13,31|rgba\(6,182,212|#06b6d4/);
});

test("Builder step two upload surfaces use theme-aware form tokens", async () => {
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");
  const upload = await readFile(
    new URL("../components/builder/UploadStep.jsx", import.meta.url),
    "utf8"
  );

  assert.match(css, /\.builder-form-theme\s*\{[\s\S]*--builder-form-surface:\s*#ffffff/);
  assert.match(css, /\.builder-form-theme\s*\{[\s\S]*--builder-form-surface-muted:\s*#f4f4f5/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-form-theme\s*\{[\s\S]*--builder-form-surface:\s*#111114/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-form-theme\s*\{[\s\S]*--builder-form-surface-muted:\s*#17171b/);
  assert.match(upload, /var\(--builder-form-surface\)/);
  assert.match(upload, /var\(--builder-form-surface-muted\)/);
  assert.match(upload, /var\(--builder-form-border\)/);
  assert.match(upload, /var\(--builder-form-border-soft\)/);
  assert.match(upload, /var\(--builder-form-accent-border\)/);
  assert.match(upload, /var\(--builder-form-focus-ring\)/);
  assert.match(upload, /builder-upload-count/);
  assert.match(css, /\.builder-form-theme \.builder-upload-count\s*\{[\s\S]*color:\s*var\(--accent\)/);
  assert.doesNotMatch(upload, /background:\s*"#ffffff"/);
  assert.doesNotMatch(upload, /background:\s*"#f4f4f5"/);
  assert.doesNotMatch(upload, /border:\s*"[^"]*#d4d4d8/);
  assert.doesNotMatch(upload, /hover:bg-\[#ffffff\]|hover:bg-\[#f4f4f5\]/);
  assert.doesNotMatch(upload, /text-primary\/80/);
});

test("Builder first step timeline and form use theme-aware surfaces", async () => {
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");
  const stepIndicator = await readFile(
    new URL("../components/builder/StepIndicator.jsx", import.meta.url),
    "utf8"
  );

  assert.match(stepIndicator, /var\(--builder-step-track\)/);
  assert.match(stepIndicator, /var\(--builder-step-active-soft\)/);
  assert.match(css, /\.builder-topbar\.app-design\s*\{[\s\S]*--builder-step-track:/);
  assert.match(css, /\.builder-step-node\s*\{[\s\S]*background:\s*var\(--builder-step-node-bg\)/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-topbar\.app-design\s*\{[\s\S]*--builder-step-track:/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-form-theme\s*\{[\s\S]*--builder-form-surface:\s*#111114/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-form-theme \.step-card\s*\{[\s\S]*background:\s*var\(--builder-form-surface\)/);
});

test("Builder template cards use theme-aware surfaces in dark mode", async () => {
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");
  const template = await readFile(
    new URL("../components/builder/TemplateStep.jsx", import.meta.url),
    "utf8"
  );

  assert.match(template, /bg-surface-lowest/);
  assert.match(template, /hover:bg-surface-container/);
  assert.match(template, /border-surface-container-high/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-form-theme \.bg-surface-lowest,[\s\S]*\.builder-form-theme \.bg-surface-container\s*\{[\s\S]*background-color:\s*var\(--builder-form-surface\)/);
  assert.match(css, /body\[data-theme="dark"\] \.builder-form-theme \.hover\\:bg-surface-container:hover\s*\{[\s\S]*background-color:\s*var\(--builder-form-surface-muted\)/);
});

test("EditStep wraps dense controls on mobile while preserving desktop layout", async () => {
  const source = await readFile(
    new URL("../components/builder/EditStep.jsx", import.meta.url),
    "utf8"
  );
  const toolbar = await readFile(
    new URL("../components/builder/RichTextToolbar.jsx", import.meta.url),
    "utf8"
  );

  assert.match(source, /flex-wrap gap-3/);
  assert.match(source, /w-full sm:w-auto/);
  assert.match(source, /p-3 sm:px-5/);
  assert.match(source, /sticky top-0 lg:top-\[85px\]/);
  assert.match(source, /p-2 sm:p-4 lg:p-10/);
  assert.match(toolbar, /flex-wrap sm:flex-nowrap/);
});

test("RichTextToolbar uses builder surface tokens for polished controls", async () => {
  const toolbar = await readFile(
    new URL("../components/builder/RichTextToolbar.jsx", import.meta.url),
    "utf8"
  );

  assert.match(toolbar, /builder-richtext-toolbar/);
  assert.match(toolbar, /bg-surface-container/);
  assert.match(toolbar, /border-surface-container-high/);
  assert.match(toolbar, /bg-surface-lowest/);
  assert.match(toolbar, /bg-surface-container-highest/);
  assert.match(toolbar, /text-on-surface-variant hover:text-on-surface/);
  assert.match(toolbar, /h-8 w-8 inline-flex items-center justify-center/);
  assert.doesNotMatch(toolbar, /bg-\[#f4f4f5\]|border-\[#d4d4d8\]|hover:bg-white/);
});
