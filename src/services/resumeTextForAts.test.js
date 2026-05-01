import test from "node:test";
import assert from "node:assert/strict";

import { buildResumeTextForAts } from "./resumeTextForAts.js";

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

test("buildResumeTextForAts tolerates empty sections", () => {
  assert.equal(typeof buildResumeTextForAts({}), "string");
});
