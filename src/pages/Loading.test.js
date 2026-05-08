import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Loading screens use global light and dark theme loading tokens", async () => {
  const loadingSource = await readFile(new URL("./Loading.jsx", import.meta.url), "utf8");
  const spinnerSource = await readFile(new URL("../components/ui/Spinner.jsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../index.css", import.meta.url), "utf8");

  assert.match(cssSource, /:root \{[\s\S]*--loading-bg: #ffffff;/);
  assert.match(cssSource, /body\[data-theme="dark"\] \{[\s\S]*--loading-bg: #0a0a0c;/);
  assert.match(loadingSource, /var\(--loading-bg,#ffffff\)/);
  assert.match(spinnerSource, /var\(--loading-bg,#ffffff\)/);
  assert.doesNotMatch(loadingSource, /--loading-bg: #000000/);
});
