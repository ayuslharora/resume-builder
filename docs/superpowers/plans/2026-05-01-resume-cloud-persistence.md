# Resume Cloud Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove browser `localStorage` from the resume save/load flow so Firestore is the only persisted source of truth and deleted resumes cannot reappear from stale cache.

**Architecture:** Resume documents and lists will be loaded only from Firestore through `useFirestore`. `ResumeContext` will keep unsaved builder edits only in React state for the current tab and will stop mirroring them into `localStorage`.

**Tech Stack:** React, React Context, Firebase Firestore, Node test runner, ESLint

---

### File Structure

**Modify**
- `src/services/resumePersistence.js` to remove cache-merge helpers that no longer belong in the persistence model.
- `src/services/resumePersistence.test.js` to replace cache-oriented tests with Firestore-only behavior tests.
- `src/hooks/useFirestore.js` to remove cache reads/writes from create, read, update, delete, and list flows.
- `src/context/ResumeContext.jsx` to stop bootstrapping and persisting builder state through `localStorage`.
- `src/pages/Dashboard.jsx` to fetch resumes only from Firestore and delete items only after confirmation from the backend call.
- `src/pages/Resumes.jsx` to do the same for the dedicated resumes page.
- `src/components/layout/Sidebar.jsx` to stop rendering resume shortcuts from cached list data.

**Delete**
- `src/services/resumeCache.js` after all imports are removed.

### Task 1: Lock in Firestore-only helper behavior

**Files:**
- Modify: `src/services/resumePersistence.test.js`
- Modify: `src/services/resumePersistence.js`

- [ ] **Step 1: Write the failing test**

```js
test("buildResumeWriteData prefers explicit userId from incoming data", () => {
  assert.deepEqual(
    buildResumeWriteData(
      { id: "resume-1", userId: "user-1", title: "Old" },
      { userId: "user-2", title: "New" }
    ),
    { userId: "user-2", title: "New" }
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/services/resumePersistence.test.js`
Expected: FAIL because `buildResumeWriteData` currently preserves the cached `userId` even when the new data explicitly provides a different one.

- [ ] **Step 3: Write minimal implementation**

```js
export function buildResumeWriteData(existingResume, data) {
  return {
    ...(existingResume?.userId && !data?.userId ? { userId: existingResume.userId } : {}),
    ...data,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/services/resumePersistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/resumePersistence.js src/services/resumePersistence.test.js
git commit -m "test: cover firestore-only resume write helpers"
```

### Task 2: Remove cache usage from Firestore persistence

**Files:**
- Modify: `src/hooks/useFirestore.js`
- Modify: `src/services/resumePersistence.js`

- [ ] **Step 1: Write the failing test**

```js
test("mergeCachedAndServerResumes is no longer exported", async () => {
  const module = await import("./resumePersistence.js");
  assert.equal("mergeCachedAndServerResumes" in module, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/services/resumePersistence.test.js`
Expected: FAIL because the cache merge helper is still exported.

- [ ] **Step 3: Write minimal implementation**

```js
import {
  buildResumeWriteData,
  getUserResumeQueryConstraints,
} from "../services/resumePersistence";
```

Remove cache imports and all `setCachedResume`, `getCachedResume`, `getCachedResumeList`, `upsertCachedResumeInList`, `removeCachedResume`, and `removeCachedResumeFromList` usage from `useFirestore`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/services/resumePersistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFirestore.js src/services/resumePersistence.js src/services/resumePersistence.test.js
git commit -m "refactor: remove resume local cache from firestore hook"
```

### Task 3: Remove cache-backed builder bootstrap and save mirroring

**Files:**
- Modify: `src/context/ResumeContext.jsx`

- [ ] **Step 1: Write the failing test**

```js
test("getResumeBuilderStep still restores the furthest completed step from Firestore data", () => {
  assert.equal(
    getResumeBuilderStep({
      interviewAnswers: { targetRole: "Engineer" },
      bragSheetText: "Built APIs",
      templateId: "modern",
    }),
    4
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/services/resumePersistence.test.js`
Expected: FAIL only if helper coverage regresses while removing cache code.

- [ ] **Step 3: Write minimal implementation**

```js
const data = await getResume(resumeId);
if (data) {
  dispatch({
    type: "LOAD_STATE",
    payload: {
      bragSheetText: data.bragSheetText ?? "",
      photoURL: data.photoURL ?? null,
      interviewAnswers: data.interviewAnswers ?? initialBuilderState.interviewAnswers,
      templateId: data.templateId ?? null,
      resumeData: data.resumeData ?? null,
    },
  });
  setCurrentStep(getResumeBuilderStep(data));
}
```

Remove `persistLocally`, remove cache imports, and keep debounced save behavior pointed only at `updateResume`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/services/resumePersistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/context/ResumeContext.jsx src/services/resumePersistence.test.js
git commit -m "refactor: keep resume edits in memory instead of local storage"
```

### Task 4: Remove cache-backed resume list bootstrapping from UI

**Files:**
- Modify: `src/pages/Dashboard.jsx`
- Modify: `src/pages/Resumes.jsx`
- Modify: `src/components/layout/Sidebar.jsx`
- Delete: `src/services/resumeCache.js`

- [ ] **Step 1: Write the failing test**

```js
test("resume persistence module no longer exposes cache merge APIs", async () => {
  const module = await import("./resumePersistence.js");
  assert.equal("mergeCachedAndServerResume" in module, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test src/services/resumePersistence.test.js`
Expected: FAIL because the old cache helper is still exported.

- [ ] **Step 3: Write minimal implementation**

```js
onDelete={async () => {
  try {
    await deleteResume(resume.id);
    setResumes((prev) => prev.filter((r) => r.id !== resume.id));
  } catch (error) {
    console.error(error);
  }
}}
```

Remove `fromCache` UI state and all `resumeCache` imports from Dashboard, Resumes, and Sidebar. Delete `src/services/resumeCache.js` once the import graph is clean.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test src/services/resumePersistence.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.jsx src/pages/Resumes.jsx src/components/layout/Sidebar.jsx src/services/resumeCache.js src/services/resumePersistence.js src/services/resumePersistence.test.js
git commit -m "fix: remove stale resume cache from resume screens"
```

### Task 5: Verify the full change

**Files:**
- Modify: none

- [ ] **Step 1: Run focused tests**

Run: `node --test src/services/resumePersistence.test.js`
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
git commit -m "refactor: make firestore the only persisted resume store"
```
