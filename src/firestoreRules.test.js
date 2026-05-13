import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("resume updates keep userId and createdAt immutable in Firestore rules", async () => {
  const rules = await readFile(new URL("../firestore.rules", import.meta.url), "utf8");

  assert.match(rules, /allow update: if request\.auth != null[\s\S]*request\.resource\.data\.userId == resource\.data\.userId[\s\S]*request\.resource\.data\.createdAt == resource\.data\.createdAt;/);
  assert.match(rules, /allow create: if request\.auth != null && request\.auth\.uid == request\.resource\.data\.userId;/);
  assert.match(rules, /match \/publicResumes\/\{shareToken\} \{[\s\S]*allow get: if true;[\s\S]*allow list: if false;/);
  assert.match(rules, /match \/publicGraderReports\/\{shareToken\} \{[\s\S]*allow get: if true;[\s\S]*allow list: if false;/);
  assert.doesNotMatch(rules, /resource\.data\.isShared == true/);
});
