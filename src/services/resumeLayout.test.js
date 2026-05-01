import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { RESUME_PAGE_MIN_HEIGHT_PX } from "./resumeLayout.js";

test("resume page min height matches an A4 page at 850px width", () => {
  assert.equal(RESUME_PAGE_MIN_HEIGHT_PX, 1202);
});

test("sidebar templates use the shared resume page min height", () => {
  const professionalSource = readFileSync(new URL("../components/templates/Professional.jsx", import.meta.url), "utf8");
  const modernSource = readFileSync(new URL("../components/templates/Modern.jsx", import.meta.url), "utf8");
  const creativeSource = readFileSync(new URL("../components/templates/Creative.jsx", import.meta.url), "utf8");

  for (const source of [professionalSource, modernSource, creativeSource]) {
    assert.match(source, /RESUME_PAGE_MIN_HEIGHT_STYLE/);
  }
});
