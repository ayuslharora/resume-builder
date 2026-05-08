import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";

test("/resumes is not exposed as a duplicate resume-list surface", async () => {
  const appSource = await readFile(new URL("./App.jsx", import.meta.url), "utf8");
  const sidebarSource = await readFile(new URL("./components/layout/Sidebar.jsx", import.meta.url), "utf8");

  assert.doesNotMatch(appSource, /path:\s*["']\/resumes["']/);
  assert.doesNotMatch(appSource, /import\(["']\.\/pages\/Resumes["']\)/);
  assert.doesNotMatch(sidebarSource, /path:\s*["']\/resumes["']/);
  assert.doesNotMatch(sidebarSource, /My Resumes/);

  await assert.rejects(
    access(new URL("./pages/Resumes.jsx", import.meta.url), constants.F_OK),
    /ENOENT/
  );
});

test("app shell uses a single current sidebar implementation", async () => {
  const appLayoutSource = await readFile(new URL("./components/layout/AppLayout.jsx", import.meta.url), "utf8");
  const sidebarSource = await readFile(new URL("./components/layout/Sidebar.jsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("./index.css", import.meta.url), "utf8");

  assert.doesNotMatch(sidebarSource, /variant\s*=/);
  assert.doesNotMatch(sidebarSource, /variant\s*===\s*["']workspace["']/);
  assert.doesNotMatch(sidebarSource, /renderSidebarContent/);
  assert.match(sidebarSource, /app-sidebar-desktop/);
  assert.match(sidebarSource, /app-sidebar-mobile/);
  assert.match(cssSource, /body\.ats-panel-open \.app-sidebar-desktop/);
  assert.match(cssSource, /body\.ats-panel-open \.app-sidebar-mobile/);
  assert.doesNotMatch(appLayoutSource, /<Sidebar\s+variant=/);
});
