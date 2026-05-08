import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Sidebar includes the creator credit in the desktop profile area", async () => {
  const source = await readFile(new URL("../components/layout/Sidebar.jsx", import.meta.url), "utf8");

  assert.match(source, /ResuMe by Ayush/);
  assert.match(source, /Ayuslh\.in/);
});

test("Sidebar profile area opens an account menu with profile settings", async () => {
  const source = await readFile(new URL("../components/layout/Sidebar.jsx", import.meta.url), "utf8");

  assert.match(source, /function ProfilePopover/);
  assert.match(source, /aria-label="Open account menu"/);
  assert.match(source, /Profile settings/);
  assert.match(source, /Sign out/);
  assert.match(source, /setProfileOpen/);
});

test("Sidebar account menu includes dummy appearance controls", async () => {
  const source = await readFile(new URL("../components/layout/Sidebar.jsx", import.meta.url), "utf8");

  assert.match(source, /Appearance/);
  assert.match(source, /Light/);
  assert.match(source, /Dark/);
  assert.match(source, /Accent/);
  assert.match(source, /aria-label="Blue accent preview"/);
  assert.match(source, /aria-label="Mono accent preview"/);
  assert.doesNotMatch(source, /document\.documentElement\.dataset\.theme/);
});

test("Sidebar appearance segmented control uses equal full-width buttons", async () => {
  const source = await readFile(new URL("../index.css", import.meta.url), "utf8");

  assert.match(source, /\.app-design \.seg\s*\{[^}]*display:\s*flex/s);
  assert.match(source, /\.app-design \.seg>button\s*\{[^}]*flex:\s*1/s);
});

test("Sidebar keeps the creator credit out of the account menu", async () => {
  const source = await readFile(new URL("../components/layout/Sidebar.jsx", import.meta.url), "utf8");
  const creditOccurrences = source.match(/ResuMe by Ayush/g) || [];

  assert.equal(creditOccurrences.length, 1);
});

test("Profile page includes the creator credit link", async () => {
  const source = await readFile(new URL("./Profile.jsx", import.meta.url), "utf8");

  assert.match(source, /Built and designed by Ayush/);
  assert.match(source, /Visit portfolio: Ayuslh\.in/);
  assert.match(source, /https:\/\/Ayuslh\.in/);
  assert.match(source, /target="_blank"/);
});

test("Profile page uses the Claude design shell classes", async () => {
  const source = await readFile(new URL("./Profile.jsx", import.meta.url), "utf8");

  assert.match(source, /app-page app-page-narrow/);
  assert.match(source, /className="panel/);
  assert.match(source, /profile-avatar/);
  assert.doesNotMatch(source, /rgba\(25,31,49/);
});
