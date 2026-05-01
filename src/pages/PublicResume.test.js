import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("PublicResume resolves resumes by share token", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /const \{ token \} = useParams\(\)/);
  assert.match(source, /getResumeByShareToken/);
});

test("PublicResume uses the shared app brand icon instead of a letter badge", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /FileText/);
  assert.doesNotMatch(source, />\s*R\s*</);
});
