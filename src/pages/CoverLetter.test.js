import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("CoverLetter exports PDF through browser print instead of the unsafe PDF API", async () => {
  const source = await readFile(new URL("./CoverLetter.jsx", import.meta.url), "utf8");

  assert.match(source, /handlePrintPDF/);
  assert.match(source, /window\.print\(\)/);
  assert.match(source, /Save as PDF/);
  assert.match(source, /print-hide/);
  assert.match(source, /print-resume-wrapper/);
  assert.match(source, /print-resume-document/);
  assert.doesNotMatch(source, /exportPDF/);
});

test("CoverLetter fullscreen CSS follows app theme and accent tokens", async () => {
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");

  assert.match(css, /body:has\(aside\.print-hide\+main\.print-resume-wrapper\),[\s\S]*?--accent:\s*#2563eb/);
  assert.match(css, /body\[data-theme="dark"\]:has\(aside\.print-hide\+main\.print-resume-wrapper\),[\s\S]*?--accent:\s*#2563eb/);
  assert.match(css, /body\[data-accent="mono"\]:has\(aside\.print-hide\+main\.print-resume-wrapper\),[\s\S]*?--accent:\s*#0a0a0b/);
  assert.match(css, /body\[data-theme="dark"\]\[data-accent="mono"\]:has\(aside\.print-hide\+main\.print-resume-wrapper\),[\s\S]*?--accent:\s*#fafafa/);
  assert.match(css, /body:has\(aside\.print-hide\+main\.print-resume-wrapper\) \[class\*="text-blue-"\],[\s\S]*?color:\s*var\(--accent\) !important/);
  assert.match(css, /aside\.print-hide textarea:focus\s*\{[\s\S]*?border-color:\s*var\(--accent\)/);
});
