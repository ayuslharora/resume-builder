import test from "node:test";
import assert from "node:assert/strict";

import {
  buildResumeWriteData,
  getResumeBuilderStep,
  mergeCachedAndServerResume,
  mergeCachedAndServerResumes,
} from "./resumePersistence.js";

test("getResumeBuilderStep restores the farthest completed builder step", () => {
  assert.equal(getResumeBuilderStep({}), 1);
  assert.equal(getResumeBuilderStep({ interviewAnswers: { targetRole: "Engineer" } }), 2);
  assert.equal(getResumeBuilderStep({ bragSheetText: "Built payments APIs" }), 3);
  assert.equal(getResumeBuilderStep({ templateId: "modern" }), 4);
  assert.equal(getResumeBuilderStep({ resumeData: { summary: "Test" } }), 5);
  assert.equal(getResumeBuilderStep({ status: "complete", templateId: "modern" }), 5);
});

test("mergeCachedAndServerResumes keeps cached drafts when Firestore returns an empty list", () => {
  const cached = [{ id: "local-1", title: "Pending Resume", updatedAt: 200 }];

  assert.deepEqual(mergeCachedAndServerResumes([], cached), cached);
});

test("mergeCachedAndServerResumes prefers server data while preserving unsynced cached items", () => {
  const server = [{ id: "remote-1", title: "Remote Resume", updatedAt: 300 }];
  const cached = [
    { id: "local-1", title: "Pending Resume", updatedAt: 200 },
    { id: "remote-1", title: "Old Remote Resume", updatedAt: 100 },
  ];

  assert.deepEqual(mergeCachedAndServerResumes(server, cached), [
    { id: "remote-1", title: "Remote Resume", updatedAt: 300 },
    { id: "local-1", title: "Pending Resume", updatedAt: 200 },
  ]);
});

test("mergeCachedAndServerResume keeps newer cached builder progress over stale Firestore data", () => {
  const server = {
    id: "resume-1",
    title: "Engineer",
    interviewAnswers: { targetRole: "Engineer" },
    updatedAt: 100,
  };
  const cached = {
    id: "resume-1",
    title: "Engineer",
    interviewAnswers: { targetRole: "Engineer" },
    bragSheetText: "New local progress",
    updatedAt: 200,
  };

  assert.deepEqual(mergeCachedAndServerResume(server, cached), cached);
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
