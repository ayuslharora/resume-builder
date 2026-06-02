import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("save-groq-key does not log the key value", async () => {
  const src = await readFile(new URL("./save-groq-key.js", import.meta.url), "utf8");
  assert.doesNotMatch(src, /console\.(log|info|debug)\s*\(\s*groqApiKey/);
  assert.doesNotMatch(src, /console\.(log|info|debug)\s*\(\s*key/);
});

test("save-groq-key validates key format before any Firestore write", async () => {
  const src = await readFile(new URL("./save-groq-key.js", import.meta.url), "utf8");
  // isValidGroqKeyFormat must appear before any .set( or .update(
  const formatCheckIdx = src.indexOf("isValidGroqKeyFormat");
  const firestoreWriteIdx = Math.min(
    src.includes(".set(") ? src.indexOf(".set(") : Infinity,
    src.includes(".update(") ? src.indexOf(".update(") : Infinity
  );
  assert.ok(formatCheckIdx < firestoreWriteIdx, "format check must come before Firestore write");
});

test("save-groq-key writes to userSecrets collection not users", async () => {
  const src = await readFile(new URL("./save-groq-key.js", import.meta.url), "utf8");
  assert.match(src, /userSecrets/);
});

test("save-groq-key only accepts POST", async () => {
  const src = await readFile(new URL("./save-groq-key.js", import.meta.url), "utf8");
  assert.match(src, /req\.method\s*!==\s*['"]POST['"]/);
});
