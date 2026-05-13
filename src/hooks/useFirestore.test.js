import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("resume view writes update only lastViewedAt after the first distinct view", async () => {
  const source = await readFile(new URL("./useFirestore.js", import.meta.url), "utf8");

  assert.match(source, /updateDoc\(viewRef,\s*\{\s*lastViewedAt: serverTimestamp\(\),\s*\}\)/s);
  assert.match(source, /catch \{[\s\S]*await setDoc\(viewRef,\s*\{[\s\S]*createdAt: serverTimestamp\(\),[\s\S]*lastViewedAt: serverTimestamp\(\),[\s\S]*\}\)/);
});

test("resume view count queries include ownerId for security-rule compatibility", async () => {
  const source = await readFile(new URL("./useFirestore.js", import.meta.url), "utf8");

  assert.match(source, /const getResumeViewCounts = useCallback\(async \(resumeIds = \[\], ownerId = ""\)/);
  assert.match(source, /where\("resumeId", "==", resumeId\),\s*where\("ownerId", "==", ownerId\)/s);
});

test("shared resume and grader report lookups include isShared query constraints", async () => {
  const source = await readFile(new URL("./useFirestore.js", import.meta.url), "utf8");

  const resumeLookup = source.slice(
    source.indexOf("const getResumeByShareToken"),
    source.indexOf("const createGraderReport")
  );
  const reportLookup = source.slice(
    source.indexOf("const getGraderReportByShareToken"),
    source.indexOf("const recordResumeView")
  );

  assert.match(resumeLookup, /where\("shareToken", "==", shareToken\),\s*where\("isShared", "==", true\)/s);
  assert.match(reportLookup, /where\("shareToken", "==", shareToken\),\s*where\("isShared", "==", true\)/s);
});

test("resume creation and grader report creation keep ownership timestamps server-controlled", async () => {
  const source = await readFile(new URL("./useFirestore.js", import.meta.url), "utf8");

  assert.match(
    source,
    /const docData = \{\s*title: "Untitled Resume",\s*status: "draft",\s*\.\.\.data,\s*userId,\s*createdAt: serverTime,\s*updatedAt: serverTime,\s*\}/s
  );
  assert.match(
    source,
    /await setDoc\(docRef, \{\s*\.\.\.data,\s*isShared: true,\s*createdAt: serverTime,\s*updatedAt: serverTime,\s*\}\)/s
  );
});
