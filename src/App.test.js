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
