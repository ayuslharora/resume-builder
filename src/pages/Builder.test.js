import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Builder shows a sticky back button while step 4 is active", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /currentStep >= 4[\s\S]*?<button onClick=\{prevStep\}[\s\S]*Back/
  );
});

test("Builder keeps the sticky back button visible through step 5", async () => {
  const source = await readFile(new URL("./Builder.jsx", import.meta.url), "utf8");

  assert.match(
    source,
    /currentStep >= 4[\s\S]*?<button onClick=\{prevStep\}[\s\S]*Back/
  );
});
