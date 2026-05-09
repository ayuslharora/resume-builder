import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const publicPages = [
  ["Landing", "../../pages/Landing.jsx"],
  ["Pricing", "../../pages/Pricing.jsx"],
  ["Templates", "../../pages/Templates.jsx"],
  ["GraderInfo", "../../pages/GraderInfo.jsx"],
];

test("PublicFooter owns the shared public-page footer copy", async () => {
  const source = await readFile(new URL("./PublicFooter.jsx", import.meta.url), "utf8");

  assert.match(source, /export default function PublicFooter/);
  assert.match(source, /ResuMe by Ayush/);
  assert.match(source, /Ayuslh\.in/);
  assert.doesNotMatch(source, /built with care/);
});

test("public marketing pages render the shared PublicFooter component", async () => {
  for (const [pageName, pagePath] of publicPages) {
    const source = await readFile(new URL(pagePath, import.meta.url), "utf8");

    assert.match(source, /import PublicFooter from "\.\.\/components\/layout\/PublicFooter"/, `${pageName} imports PublicFooter`);
    assert.match(source, /<PublicFooter \/>/, `${pageName} renders PublicFooter`);
    assert.doesNotMatch(source, /built with care/, `${pageName} does not keep old footer copy`);
  }
});
