import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("PublicResume resolves resumes by share token", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /const \{ token \} = useParams\(\)/);
  assert.match(source, /getResumeByShareToken/);
});

test("PublicResume uses the favicon for the shared app brand mark", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /src="\/favicon\.svg"/);
  assert.doesNotMatch(source, /FileText size=\{16\}/);
  assert.doesNotMatch(source, />\s*R\s*</);
});

test("PublicResume includes the compact shared credit", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /ResuMe by Ayush/);
  assert.match(source, /href="https:\/\/Ayuslh\.in"/);
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noreferrer"/);
});
