import test from "node:test";
import assert from "node:assert/strict";

import {
  buildResumeTitleUpdate,
  buildResumeWriteData,
  getResumeBuilderStep,
  getUserResumeQueryConstraints,
  normalizeResumeTitle,
} from "./resumePersistence.js";

test("getResumeBuilderStep restores the farthest completed builder step", () => {
  assert.equal(getResumeBuilderStep({}), 1);
  assert.equal(getResumeBuilderStep({ interviewAnswers: { targetRole: "Engineer" } }), 2);
  assert.equal(getResumeBuilderStep({ bragSheetText: "Built payments APIs" }), 3);
  assert.equal(getResumeBuilderStep({ templateId: "modern" }), 4);
  assert.equal(getResumeBuilderStep({ resumeData: { summary: "Test" } }), 5);
  assert.equal(getResumeBuilderStep({ status: "complete", templateId: "modern" }), 5);
});

test("buildResumeWriteData preserves userId from cached resume for cloud upserts", () => {
  assert.deepEqual(
    buildResumeWriteData(
      { id: "resume-1", userId: "user-1", title: "Old" },
      { title: "New" }
    ),
    { userId: "user-1", title: "New" }
  );
});

test("buildResumeWriteData prefers explicit userId from incoming data", () => {
  assert.deepEqual(
    buildResumeWriteData(
      { id: "resume-1", userId: "user-1", title: "Old" },
      { userId: "user-2", title: "New" }
    ),
    { userId: "user-2", title: "New" }
  );
});

test("normalizeResumeTitle trims titles and falls back when empty", () => {
  assert.equal(normalizeResumeTitle("  Product Manager Resume  "), "Product Manager Resume");
  assert.equal(normalizeResumeTitle("   "), "Untitled Resume");
  assert.equal(normalizeResumeTitle(null), "Untitled Resume");
});

test("buildResumeTitleUpdate creates the Firestore title patch", () => {
  assert.deepEqual(
    buildResumeTitleUpdate("  Backend Resume  "),
    { title: "Backend Resume" }
  );
});

test("resumePersistence no longer exports cache merge helpers", async () => {
  const module = await import("./resumePersistence.js");

  assert.equal("mergeCachedAndServerResume" in module, false);
  assert.equal("mergeCachedAndServerResumes" in module, false);
});

test("getUserResumeQueryConstraints avoids Firestore composite index requirements", () => {
  const constraints = getUserResumeQueryConstraints(
    (...args) => ({ type: "where", args }),
    "user-1"
  );

  assert.deepEqual(constraints, [
    { type: "where", args: ["userId", "==", "user-1"] },
  ]);
});
