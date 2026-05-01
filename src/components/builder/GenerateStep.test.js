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
