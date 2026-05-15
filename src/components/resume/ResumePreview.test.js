import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("ResumePreview applies global typography style from resume theme", async () => {
  const source = await readFile(new URL("./ResumePreview.jsx", import.meta.url), "utf8");

  assert.match(source, /getResumeTypographyStyle/);
  assert.match(source, /const typographyStyle = getResumeTypographyStyle\(resumeData\?\.theme\)/);
  assert.match(source, /style=\{\{ \.\.\.typographyStyle, transform: `scale\(\$\{scale\}\)`, transformOrigin: 'top center' \}\}/);
});
