import test from "node:test";
import assert from "node:assert/strict";

import { buildLlmTaskRequest } from "./groqTasks.js";

test("server-owned grader task ignores hostile client options", () => {
  const taskRequest = buildLlmTaskRequest("gradeResume", {
    resumeText: "Built APIs and improved latency.",
    targetContext: {
      targetRole: "Backend Engineer",
      jobDescription: "Needs API design and reliability.",
      reviewTone: "ATS strict",
    },
    options: {
      model: "attacker-model",
      temperature: 2,
      max_tokens: 999999,
    },
  });

  assert.match(taskRequest.systemPrompt, /expert ATS optimizer/);
  assert.match(taskRequest.userPrompt, /Built APIs and improved latency/);
  assert.match(taskRequest.userPrompt, /Backend Engineer/);
  assert.equal(taskRequest.options.temperature, 0);
  assert.equal(taskRequest.options.top_p, 1);
  assert.equal(taskRequest.options.model, undefined);
  assert.notEqual(taskRequest.options.max_tokens, 999999);
});

test("server-owned task builder rejects unsupported and oversized requests", () => {
  assert.throws(
    () => buildLlmTaskRequest("legacyPrompt", { systemPrompt: "x", userPrompt: "y" }),
    /Unsupported AI task/
  );

  assert.throws(
    () => buildLlmTaskRequest("extractBasicInfo", { bragSheetText: "x".repeat(120_001) }),
    /AI request payload is too large/
  );
});
