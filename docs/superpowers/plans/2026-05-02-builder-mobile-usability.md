# Builder Mobile Usability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the resume builder usable on phones while preserving the desktop builder unchanged.

**Architecture:** Keep the current builder flow and desktop layout intact, but introduce mobile-only layout behavior below `lg` in the shared builder shell and the step components that currently overflow or compress. Use small JSX and CSS changes instead of broad structural rewrites so the mobile fixes stay isolated from desktop behavior.

**Tech Stack:** React, React Router, Tailwind utility classes, existing local CSS, Node test runner

---

### Task 1: Lock in regression coverage for mobile-specific builder behavior

**Files:**
- Modify: `src/pages/Builder.test.js`

- [ ] **Step 1: Write the failing tests**

Add assertions that verify the builder source contains mobile-only layout hooks for the sticky header and bottom padding:

```js
test("Builder stacks its mobile sticky header without changing desktop layout", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(source, /flex-col gap-3 lg:flex-row lg:items-center/);
  assert.match(source, /w-full lg:flex-1 lg:min-w-0/);
});

test("Builder reserves mobile bottom space for step actions above the bottom nav", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(source, /pb-\\[calc\\(8\\.5rem\\+env\\(safe-area-inset-bottom\\)\\)\\] lg:pb-20/);
});
```

- [ ] **Step 2: Run the test file to verify it fails**

Run: `node --test src/pages/Builder.test.js`

Expected: FAIL because the new mobile layout class strings are not in `src/pages/Builder.jsx` yet.

- [ ] **Step 3: Implement the minimal builder shell updates**

Update `src/pages/Builder.jsx` so the sticky header and main content become mobile-safe without changing desktop behavior:

```jsx
<div className="w-full max-w-5xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
  {currentStep >= 4 && (
    <button onClick={prevStep} className="btn-ghost shrink-0 self-start lg:self-auto">
      <ChevronLeft size={16} /> Back
    </button>
  )}
  <div className="w-full lg:flex-1 lg:min-w-0">
    <StepIndicator currentStep={currentStep} />
  </div>
</div>
```

and:

```jsx
<main className={`flex-1 w-full px-3 py-4 sm:p-6 ${currentStep === 4 ? "pb-4 overflow-hidden" : "pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-20"}`}>
```

- [ ] **Step 4: Run the builder test file again**

Run: `node --test src/pages/Builder.test.js`

Expected: PASS.

### Task 2: Make the step indicator readable on phones only

**Files:**
- Modify: `src/components/builder/StepIndicator.jsx`

- [ ] **Step 1: Write the failing test**

Create a source-level assertion that the step indicator provides a compact mobile progress mode and keeps a desktop-only full mode:

```js
test("StepIndicator has a compact mobile progress mode", async () => {
  const source = await readFile(new URL("./builder/StepIndicator.jsx", import.meta.url), "utf8");

  assert.match(source, /lg:flex/);
  assert.match(source, /lg:hidden/);
  assert.match(source, /Step \\$\\{currentStep\\} of \\$\\{steps.length\\}/);
});
```

Add this test to `src/pages/Builder.test.js`.

- [ ] **Step 2: Run the test file to verify it fails**

Run: `node --test src/pages/Builder.test.js`

Expected: FAIL because `StepIndicator.jsx` does not yet contain the compact mobile mode.

- [ ] **Step 3: Implement a mobile-only compact indicator**

Update `src/components/builder/StepIndicator.jsx` to render:

- a `lg:hidden` mobile block with progress text and a compact progress bar
- the existing five-step layout wrapped in a `hidden lg:flex ...` container

Use the existing `steps` array and current progress calculation rather than adding new state.

- [ ] **Step 4: Run the builder test file again**

Run: `node --test src/pages/Builder.test.js`

Expected: PASS.

### Task 3: Tighten shared mobile builder spacing and actions

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/builder/InterviewStep.jsx`
- Modify: `src/components/builder/UploadStep.jsx`
- Modify: `src/components/builder/TemplateStep.jsx`
- Modify: `src/components/builder/GenerateStep.jsx`

- [ ] **Step 1: Write the failing tests**

Add source assertions for the mobile layout hooks:

```js
test("Builder step cards and actions include mobile-safe layout classes", async () => {
  const css = await readFile(new URL("./index.css", import.meta.url), "utf8");
  const interview = await readFile(new URL("./components/builder/InterviewStep.jsx", import.meta.url), "utf8");
  const upload = await readFile(new URL("./components/builder/UploadStep.jsx", import.meta.url), "utf8");
  const template = await readFile(new URL("./components/builder/TemplateStep.jsx", import.meta.url), "utf8");
  const generate = await readFile(new URL("./components/builder/GenerateStep.jsx", import.meta.url), "utf8");

  assert.match(css, /rounded-xl p-4 sm:p-8 max-w-3xl mx-auto mt-3 sm:mt-6/);
  assert.match(interview, /flex-col gap-3 sm:flex-row/);
  assert.match(upload, /flex-wrap/);
  assert.match(template, /flex-col gap-3 sm:flex-row/);
  assert.match(generate, /h-\\[calc\\(100dvh-250px\\)\\] lg:h-\\[calc\\(100dvh-190px\\)\\]/);
});
```

- [ ] **Step 2: Run the test file to verify it fails**

Run: `node --test src/pages/Builder.test.js`

Expected: FAIL because the mobile-safe classes are not present yet.

- [ ] **Step 3: Implement the minimal mobile-safe spacing changes**

Apply these targeted updates:

- `src/index.css`: reduce `.step-card` top margin on mobile only
- `InterviewStep.jsx`: make radio controls and footer actions wrap/stack below `sm`
- `UploadStep.jsx`: let the upload/paste control wrap and stack footer actions below `sm`
- `TemplateStep.jsx`: stack footer actions below `sm`
- `GenerateStep.jsx`: use a slightly taller mobile-safe viewport calculation and tighter padding on phones only

- [ ] **Step 4: Run the builder test file again**

Run: `node --test src/pages/Builder.test.js`

Expected: PASS.

### Task 4: Make the edit step operable on phones without changing desktop

**Files:**
- Modify: `src/components/builder/EditStep.jsx`

- [ ] **Step 1: Write the failing test**

Add a source assertion that the edit step wraps toolbar/actions on mobile and preserves desktop structure:

```js
test("EditStep wraps dense controls on mobile while preserving desktop layout", async () => {
  const source = await readFile(new URL("./components/builder/EditStep.jsx", import.meta.url), "utf8");

  assert.match(source, /flex-wrap gap-3/);
  assert.match(source, /w-full sm:w-auto/);
  assert.match(source, /p-3 sm:px-5/);
});
```

- [ ] **Step 2: Run the test file to verify it fails**

Run: `node --test src/pages/Builder.test.js`

Expected: FAIL because the mobile wrapping classes are not present yet.

- [ ] **Step 3: Implement the minimal edit-step mobile overrides**

Update `src/components/builder/EditStep.jsx` so:

- the preview panel header wraps its children on mobile
- dense action groups can break into multiple rows
- mobile-first widths (`w-full sm:w-auto`) are used for the ATS and completion buttons where appropriate
- desktop split behavior remains behind existing `lg:` classes

- [ ] **Step 4: Run the builder test file again**

Run: `node --test src/pages/Builder.test.js`

Expected: PASS.

### Task 5: Verify no regressions in the touched builder surfaces

**Files:**
- Test: `src/pages/Builder.test.js`
- Test: `src/components/builder/GenerateStep.test.js`
- Test: `src/components/builder/EditStep.test.js`

- [ ] **Step 1: Run the focused builder verification suite**

Run: `node --test src/pages/Builder.test.js src/components/builder/GenerateStep.test.js src/components/builder/EditStep.test.js`

Expected: PASS with zero failures.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: successful Vite production build with exit code `0`.
