import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Sidebar includes the creator credit in the desktop profile area", async () => {
  const source = await readFile(new URL("../components/layout/Sidebar.jsx", import.meta.url), "utf8");

  assert.match(source, /Ayush/);
  assert.match(source, /Ayuslh\.in/);
});

test("Profile page includes the creator credit link", async () => {
  const source = await readFile(new URL("./Profile.jsx", import.meta.url), "utf8");

  assert.match(source, /Ayush/);
  assert.match(source, /https:\/\/Ayuslh\.in/);
  assert.match(source, /target="_blank"/);
});
