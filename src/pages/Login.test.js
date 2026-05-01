import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Login redirects back to the attempted shared route after auth", async () => {
  const source = await readFile(new URL("./Login.jsx", import.meta.url), "utf8");

  assert.match(source, /location\.state\?\.from/);
});
