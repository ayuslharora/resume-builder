import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("ResumeCard exposes an inline title editor that saves through Firestore", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");

  assert.match(source, /isEditingTitle/);
  assert.match(source, /draftTitle/);
  assert.match(source, /handleSaveTitle/);
  assert.match(source, /buildResumeTitleUpdate/);
  assert.match(source, /updateResume\(resume\.id, buildResumeTitleUpdate\(draftTitle\)\)/);
  assert.match(source, /Rename resume title/);
  assert.match(source, /Save resume title/);
  assert.match(source, /Cancel title edit/);
});

test("ResumeCard reports publish state changes to list pages for immediate badge updates", async () => {
  const cardSource = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");
  const dashboardSource = await readFile(new URL("../../pages/Dashboard.jsx", import.meta.url), "utf8");
  const resumesSource = await readFile(new URL("../../pages/Resumes.jsx", import.meta.url), "utf8");

  assert.match(cardSource, /onPublishChange/);
  assert.match(cardSource, /onPublishChange\?\.\(resume\.id,\s*\{\s*isShared: newStatus,\s*shareToken,\s*\}\)/s);

  for (const source of [dashboardSource, resumesSource]) {
    assert.match(source, /onPublishChange=\{\(resumeId,\s*publishState\) => \{/);
    assert.match(source, /setResumes\(prev => prev\.map\(r => \(/);
    assert.match(source, /r\.id === resumeId \? \{ \.\.\.r,\s*\.\.\.publishState \} : r/s);
  }
});

test("ResumeCard applies publish changes before Firestore resolves and rolls back on failure", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");
  const handlerStart = source.indexOf("const handleTogglePublic");
  const handlerEnd = source.indexOf("useEffect", handlerStart);
  const handlerSource = source.slice(handlerStart, handlerEnd);

  const optimisticUpdateIndex = handlerSource.indexOf("onPublishChange?.(resume.id");
  const firestoreUpdateIndex = handlerSource.indexOf("await updateResume");

  assert.notEqual(optimisticUpdateIndex, -1);
  assert.notEqual(firestoreUpdateIndex, -1);
  assert.ok(
    optimisticUpdateIndex < firestoreUpdateIndex,
    "publish state must update locally before waiting for Firestore"
  );
  assert.match(handlerSource, /const previousPublishState = \{\s*isShared: resume\.isShared,\s*shareToken: resume\.shareToken,\s*\}/s);
  assert.match(handlerSource, /catch \(err\) \{[\s\S]*onPublishChange\?\.\(resume\.id,\s*previousPublishState\)/);
});

test("ResumeCard keeps the published dropdown visible while clipping only the preview artwork", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");

  assert.match(source, /className="relative flex justify-center items-start overflow-visible transition-colors w-full"/);
  assert.match(source, /className="absolute inset-0 overflow-hidden pointer-events-none z-0"/);
  assert.match(source, /<Trash2 size=\{14\} \/> Delete/);
});
