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

test("shared resume and grader report lookups use token-keyed public documents", async () => {
  const source = await readFile(new URL("./useFirestore.js", import.meta.url), "utf8");

  const resumeLookup = source.slice(
    source.indexOf("const getResumeByShareToken"),
    source.indexOf("const createGraderReport")
  );
  const reportLookup = source.slice(
    source.indexOf("const getGraderReportByShareToken"),
    source.indexOf("const recordResumeView")
  );

  assert.match(resumeLookup, /doc\(db, publicResumesCollection, shareToken\)/);
  assert.match(reportLookup, /doc\(db, publicGraderReportsCollection, shareToken\)/);
  assert.doesNotMatch(resumeLookup, /where\("shareToken", "==", shareToken\)/);
  assert.doesNotMatch(reportLookup, /where\("shareToken", "==", shareToken\)/);
});

test("resume creation and grader report creation keep ownership timestamps server-controlled", async () => {
  const source = await readFile(new URL("./useFirestore.js", import.meta.url), "utf8");

  assert.match(
    source,
    /const resumeData = stripPublicShareFields\(data\);\s*const docData = \{\s*title: "Untitled Resume",\s*status: "draft",\s*\.\.\.resumeData,\s*userId,\s*createdAt: serverTime,\s*updatedAt: serverTime,\s*\}/s
  );
  assert.match(
    source,
    /const docData = \{\s*\.\.\.reportData,\s*isShared: true,\s*createdAt: serverTime,\s*updatedAt: serverTime,\s*\};\s*const batch = writeBatch\(db\);\s*batch\.set\(docRef, docData\)/s
  );
});

test("private records and public share mirrors are committed in single batches", async () => {
  const source = await readFile(new URL("./useFirestore.js", import.meta.url), "utf8");
  const createResume = source.slice(
    source.indexOf("const createResume"),
    source.indexOf("// ─── Read single")
  );
  const createReport = source.slice(
    source.indexOf("const createGraderReport"),
    source.indexOf("const getGraderReportByShareToken")
  );
  const updateResume = source.slice(
    source.indexOf("const updateResume"),
    source.indexOf("// ─── Delete")
  );
  const deleteResume = source.slice(
    source.indexOf("const deleteResume"),
    source.indexOf("// ─── Duplicate")
  );

  assert.match(source, /writeBatch/);
  assert.match(createResume, /const batch = writeBatch\(db\)/);
  assert.match(createResume, /batch\.set\(docRef, docData\)/);
  assert.match(createResume, /await batch\.commit\(\)/);
  assert.doesNotMatch(createResume, /await setDoc/);

  assert.match(createReport, /const batch = writeBatch\(db\)/);
  assert.match(createReport, /batch\.set\(docRef,/);
  assert.match(createReport, /batch\.set\(\s*doc\(db, publicGraderReportsCollection, reportData\.shareToken\),/s);
  assert.match(createReport, /await batch\.commit\(\)/);
  assert.doesNotMatch(createReport, /await setDoc/);

  assert.match(updateResume, /const batch = writeBatch\(db\)/);
  assert.match(updateResume, /batch\.set\(docRef, nextResume, \{ merge: true \}\)/);
  assert.match(updateResume, /batch\.delete\(doc\(db, publicResumesCollection, previousShareToken\)\)/);
  assert.match(updateResume, /batch\.set\(\s*doc\(db, publicResumesCollection, nextShareToken\),/s);
  assert.match(updateResume, /await batch\.commit\(\)/);
  assert.doesNotMatch(updateResume, /await setDoc/);
  assert.doesNotMatch(updateResume, /await deleteDoc/);

  assert.match(deleteResume, /const batch = writeBatch\(db\)/);
  assert.match(deleteResume, /batch\.delete\(doc\(db, "resumes", resumeId\)\)/);
  assert.match(deleteResume, /batch\.delete\(doc\(db, publicResumesCollection, existing\.shareToken\)\)/);
  assert.match(deleteResume, /await batch\.commit\(\)/);
  assert.doesNotMatch(deleteResume, /await deleteDoc/);
});
