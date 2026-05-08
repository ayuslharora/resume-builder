import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("GenerateStep includes a persistent back button footer", async () => {
  const source = await readFile(new URL("./GenerateStep.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /<div className="mt-8 pt-5 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"[\s\S]*?<button onClick=\{prevStep\} className="btn-ghost w-full sm:w-auto"/
  );
});

test("GenerateStep loading screen uses builder theme tokens", async () => {
  const source = await readFile(new URL("./GenerateStep.jsx", import.meta.url), "utf8");

  assert.match(source, /Generating Your Resume/);
  assert.match(source, /Understanding your target role/);
  assert.match(source, /background:\s*"var\(--builder-form-surface\)"/);
  assert.match(source, /border:\s*"1px solid var\(--builder-form-border-soft\)"/);
  assert.match(source, /border:\s*"4px solid var\(--builder-form-accent-border\)"/);
  assert.match(source, /borderTopColor:\s*"var\(--accent\)"/);
  assert.doesNotMatch(source, /Ambient orb|absolute top-0 right-0 w-64 h-64|blur\(60px\)|filter:\s*"blur/);
  assert.doesNotMatch(source, /#2563eb|#bfdbfe|rgba\(6,182,212|rgba\(25,31,49|rgba\(255,255,255/);
});
