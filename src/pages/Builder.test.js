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
