# Editor ATS Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a manual ATS rescan panel to the final resume editor so users can grade the current draft without leaving the builder.

**Architecture:** `EditStep` will own the ATS panel state and invoke the existing `gradeResume` endpoint only when the user clicks `Re-scan`. A small helper will serialize the current structured `resumeData` into plain text for grading, keeping the API input deterministic and testable.

**Tech Stack:** React, Vite, Firebase-backed builder context, Groq service, Node test runner

---

### File Structure

**Create**
- `src/services/resumeTextForAts.js` for converting structured resume data into ATS scan text.
- `src/services/resumeTextForAts.test.js` for helper coverage.
- `src/components/builder/EditStep.test.js` for explicit ATS panel trigger coverage.

**Modify**
- `src/components/builder/EditStep.jsx` to add the ATS panel, manual rescan flow, and loading/error/result states.

### Task 1: Add ATS scan text serialization

**Files:**
- Create: `src/services/resumeTextForAts.js`
- Create: `src/services/resumeTextForAts.test.js`

- [ ] **Step 1: Write the failing test**

```js
test("buildResumeTextForAts includes major resume sections in readable order", () => {
  const text = buildResumeTextForAts({
    personalInfo: { fullName: "A User", email: "a@example.com" },
    summary: "Frontend engineer",
    skills: { technical: ["React", "Node.js"], soft: ["Communication"] },
    experience: [{ company: "Acme", role: "Engineer", bullets: ["Built dashboard"] }],
  });

  assert.match(text, /A User/);
  assert.match(text, /Frontend engineer/);
  assert.match(text, /React, Node\.js/);
  assert.match(text, /Acme/);
  assert.match(text, /Built dashboard/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/services/resumeTextForAts.test.js`
Expected: FAIL because the helper file does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```js
export function buildResumeTextForAts(resumeData) {
  const lines = [];
  // assemble personal info, summary, skills, experience, education, projects and extras
  return lines.filter(Boolean).join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/services/resumeTextForAts.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/resumeTextForAts.js src/services/resumeTextForAts.test.js
git commit -m "test: add ats resume text serializer"
```

### Task 2: Add explicit ATS panel trigger to the editor

**Files:**
- Modify: `src/components/builder/EditStep.jsx`
- Create: `src/components/builder/EditStep.test.js`

- [ ] **Step 1: Write the failing test**

```js
test("EditStep exposes an ATS rescan trigger in the editor toolbar", async () => {
  const source = await readFile(new URL("./EditStep.jsx", import.meta.url), "utf8");
  assert.match(source, /Re-scan/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/components/builder/EditStep.test.js`
Expected: FAIL because the editor does not include ATS rescan UI yet.

- [ ] **Step 3: Write minimal implementation**

```js
const [isAtsPanelOpen, setIsAtsPanelOpen] = useState(false);
const [isScanningAts, setIsScanningAts] = useState(false);
const [atsResult, setAtsResult] = useState(null);
const [atsError, setAtsError] = useState(null);
```

Add a toolbar button that opens the panel and runs rescans only when clicked.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/components/builder/EditStep.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/EditStep.jsx src/components/builder/EditStep.test.js
git commit -m "feat: add manual ats rescan entry point"
```

### Task 3: Render ATS results and wire the scan flow

**Files:**
- Modify: `src/components/builder/EditStep.jsx`
- Modify: `src/services/resumeTextForAts.js`

- [ ] **Step 1: Write the failing test**

```js
test("buildResumeTextForAts tolerates empty sections", () => {
  assert.equal(typeof buildResumeTextForAts({}), "string");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/services/resumeTextForAts.test.js`
Expected: FAIL if helper implementation is too narrow during panel integration.

- [ ] **Step 3: Write minimal implementation**

```js
const resumeText = buildResumeTextForAts(resumeData);
const grade = await gradeResume(resumeText, {
  targetRole: interviewAnswers.targetRole,
  jobDescription: interviewAnswers.additionalContext || "",
  reviewTone: "ATS strict",
});
setAtsResult(grade);
```

Render score, summary, breakdown, keyword gaps, and top fixes in the panel. Keep inline loading and error states local to the panel.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/services/resumeTextForAts.test.js src/components/builder/EditStep.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/builder/EditStep.jsx src/services/resumeTextForAts.js src/services/resumeTextForAts.test.js src/components/builder/EditStep.test.js
git commit -m "feat: show ats feedback in resume editor"
```

### Task 4: Verify the full change

**Files:**
- Modify: none

- [ ] **Step 1: Run focused tests**

Run: `node --test src/services/resumeTextForAts.test.js src/components/builder/EditStep.test.js`
Expected: PASS

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add manual ats panel to editor"
```
