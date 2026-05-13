import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("groq API accepts typed tasks instead of client-owned prompts", async () => {
  const apiSource = await readFile(new URL("./groq.js", import.meta.url), "utf8");
  const llmSource = await readFile(new URL("../src/services/llm.js", import.meta.url), "utf8");

  assert.match(apiSource, /buildLlmTaskRequest\(task,\s*payload\)/);
  assert.match(apiSource, /const\s+\{\s*task,\s*payload\s*\}\s*=\s*body\s*\|\|\s*\{\}/);
  assert.match(apiSource, /enforceRateLimit\(decoded\.uid,\s*task\)/);
  assert.doesNotMatch(apiSource, /const\s+\{\s*systemPrompt,\s*userPrompt,\s*options\s*\}\s*=\s*body\s*\|\|\s*\{\}/);
  assert.doesNotMatch(apiSource, /process\.env\.VITE_GROQ_API_KEY/);

  assert.match(llmSource, /JSON\.stringify\(\{\s*task,\s*payload\s*\}\)/);
  assert.doesNotMatch(llmSource, /JSON\.stringify\(\{\s*systemPrompt,\s*userPrompt,\s*options\s*\}\)/);
  assert.doesNotMatch(llmSource, /const\s+systemPrompt\s*=/);
  assert.doesNotMatch(llmSource, /const\s+userPrompt\s*=/);
});

test("provider keys are not exposed through VITE groq env examples or browser key manager code", async () => {
  const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");

  assert.match(envExample, /^GROQ_API_KEYS=/m);
  assert.doesNotMatch(envExample, /VITE_GROQ_API_KEY/);
  await assert.rejects(
    readFile(new URL("../src/services/apiKeyManager.js", import.meta.url), "utf8"),
    /ENOENT/
  );
});
