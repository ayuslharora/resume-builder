import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSharedResumeGradeSource,
  extractShareTokenFromResumeLink,
} from "./sharedResumeGraderSource.js";

test("extractShareTokenFromResumeLink accepts production URLs and shared paths", () => {
  assert.equal(
    extractShareTokenFromResumeLink("https://resume.ayuslh.in/shared/abc123?from=grader"),
    "abc123"
  );
  assert.equal(extractShareTokenFromResumeLink("/shared/localtoken"), "localtoken");
});

test("extractShareTokenFromResumeLink rejects non-shared links", () => {
  assert.equal(extractShareTokenFromResumeLink("https://resume.ayuslh.in/grader"), "");
  assert.equal(extractShareTokenFromResumeLink("not a link"), "");
});

test("buildSharedResumeGradeSource returns selectable text with high confidence", () => {
  const source = buildSharedResumeGradeSource({
    title: "Frontend Resume",
    isShared: true,
    resumeData: {
      personalInfo: { fullName: "A User", email: "a@example.com" },
      summary: "Frontend engineer",
      skills: { technical: ["React"] },
      experience: [{ role: "Engineer", company: "Acme", bullets: ["Built dashboards"] }],
    },
  });

  assert.equal(source.fileName, "Frontend Resume (ResuMe link)");
  assert.match(source.text, /A User/);
  assert.match(source.text, /Built dashboards/);
  assert.equal(source.metadata.usedOcr, false);
  assert.equal(source.metadata.confidence.label, "High");
});
