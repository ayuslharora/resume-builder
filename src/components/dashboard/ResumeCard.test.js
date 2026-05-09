import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("ResumeCard exposes an inline title editor that saves through Firestore", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");

  assert.match(source, /isEditingTitle/);
  assert.match(source, /draftTitle/);
  assert.match(source, /handleSaveTitle/);
  assert.match(source, /buildResumeTitleUpdate/);
  assert.match(source, /updateResume\(resume\.id, buildResumeTitleUpdate\(draftTitle\)\)/);
  assert.match(source, /Rename resume title/);
  assert.match(source, /Save resume title/);
  assert.match(source, /Cancel title edit/);
});

test("ResumeCard reports publish state changes to Dashboard for immediate badge updates", async () => {
  const cardSource = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");
  const dashboardSource = await readFile(new URL("../../pages/Dashboard.jsx", import.meta.url), "utf8");

  assert.match(cardSource, /onPublishChange/);
  assert.match(cardSource, /onPublishChange\?\.\(resume\.id,\s*\{\s*isShared: newStatus,\s*shareToken,\s*\}\)/s);
  assert.match(dashboardSource, /onPublishChange=\{\(resumeId,\s*publishState\) => \{/);
  assert.match(dashboardSource, /setResumes\(prev => prev\.map\(r => \(/);
  assert.match(dashboardSource, /r\.id === resumeId \? \{ \.\.\.r,\s*\.\.\.publishState \} : r/s);
});

test("ResumeCard applies publish changes before Firestore resolves and rolls back on failure", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");
  const handlerStart = source.indexOf("const handleTogglePublic");
  const handlerEnd = source.indexOf("useEffect", handlerStart);
  const handlerSource = source.slice(handlerStart, handlerEnd);

  const optimisticUpdateIndex = handlerSource.indexOf("onPublishChange?.(resume.id");
  const firestoreUpdateIndex = handlerSource.indexOf("await updateResume");

  assert.notEqual(optimisticUpdateIndex, -1);
  assert.notEqual(firestoreUpdateIndex, -1);
  assert.ok(
    optimisticUpdateIndex < firestoreUpdateIndex,
    "publish state must update locally before waiting for Firestore"
  );
  assert.match(handlerSource, /const previousPublishState = \{\s*isShared: resume\.isShared,\s*shareToken: resume\.shareToken,\s*\}/s);
  assert.match(handlerSource, /catch \(err\) \{[\s\S]*onPublishChange\?\.\(resume\.id,\s*previousPublishState\)/);
});

test("ResumeCard matches the card dashboard card anatomy", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");

  assert.match(source, /className="panel lift group relative cursor-pointer overflow-visible"/);
  assert.match(source, /aspectRatio: "1\.7",\s*padding: "14px 14px 0",\s*background: "var\(--surface\)",\s*borderBottom: "1px solid var\(--border\)",\s*overflow: "hidden",\s*position: "relative",\s*borderRadius: "12px 12px 0 0"/s);
  assert.match(source, /background: "white",\s*width: "100%",\s*aspectRatio: "0\.78",\s*borderRadius: "4px 4px 0 0",\s*padding: "16px 18px 0",\s*color: "#1a1a1a",\s*boxShadow: "0 1px 2px rgba\(0,0,0,\.04\)"/s);
  assert.match(source, /height: 12,\s*background: "linear-gradient\(to bottom, transparent, color-mix\(in oklch, var\(--surface\) 70%, transparent\)\)"/s);
  assert.match(source, /style=\{\{ position: "absolute", top: 12, right: 12, zIndex: 20 \}\}/);
  assert.match(source, /style=\{\{ position: "absolute", top: 22, left: 22 \}\}/);
  assert.match(source, /<div style=\{\{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 \}\}>/);
  assert.match(source, /<Trash2 size=\{14\} \/> Delete/);
});

test("ResumeCard shows distinct public view count as a compact meta chip", async () => {
  const source = await readFile(new URL("./ResumeCard.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../../index.css", import.meta.url), "utf8");

  assert.match(source, /Distinct public viewers/);
  assert.match(source, /className="resume-view-chip"/);
  assert.match(source, /aria-label=\{formatViewCount\(resume\.distinctViewCount\)\}/);
  assert.match(source, /formatCompactViewCount\(resume\.distinctViewCount\)/);
  assert.match(source, /<Eye size=\{12\} \/>/);
  assert.match(css, /\.app-design \.resume-view-chip\s*\{/);
  assert.match(css, /height:\s*22px/);
  assert.match(css, /max-width:\s*58px/);
});

test("Dashboard resume grid uses card auto-fill card sizing", async () => {
  const css = await readFile(new URL("../../index.css", import.meta.url), "utf8");

  assert.match(css, /\.resume-grid\s*\{\s*display: grid;\s*grid-template-columns: repeat\(auto-fill, minmax\(260px, 1fr\)\);\s*gap: 16px;\s*align-items: start;\s*\}/);
});

test("successful resume deletes notify the sidebar list immediately", async () => {
  const firestoreSource = await readFile(new URL("../../hooks/useFirestore.js", import.meta.url), "utf8");
  const sidebarSource = await readFile(new URL("../layout/Sidebar.jsx", import.meta.url), "utf8");
  const deleteStart = firestoreSource.indexOf("const deleteResume");
  const deleteEnd = firestoreSource.indexOf("  // ─── Duplicate", deleteStart);
  const deleteSource = firestoreSource.slice(deleteStart, deleteEnd);

  assert.match(firestoreSource, /notifyResumeDeleted/);
  assert.match(sidebarSource, /subscribeToResumeDeleted/);
  assert.match(sidebarSource, /setResumes\(prev => prev\.filter\(resume => resume\.id !== deletedResumeId\)\)/);

  const firestoreDeleteIndex = deleteSource.indexOf("await deleteDoc");
  const notifyIndex = deleteSource.indexOf("notifyResumeDeleted(resumeId)");
  assert.notEqual(firestoreDeleteIndex, -1);
  assert.notEqual(notifyIndex, -1);
  assert.ok(
    firestoreDeleteIndex < notifyIndex,
    "sidebar should only drop the name after the Firestore delete succeeds"
  );
});
