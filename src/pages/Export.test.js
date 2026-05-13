import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Export uses browser print for PDF instead of posting resume HTML to the API", async () => {
  const source = await readFile(new URL("./Export.jsx", import.meta.url), "utf8");
  const exportService = await readFile(new URL("../services/export.js", import.meta.url), "utf8");

  assert.match(source, /handlePrintPDF/);
  assert.match(source, /window\.print\(\)/);
  assert.match(source, /Save as PDF/);
  assert.doesNotMatch(source, /exportPDF/);
  assert.doesNotMatch(source, /exportingType === 'pdf'/);
  assert.doesNotMatch(exportService, /fetch\('\/api\/pdf'/);
  assert.doesNotMatch(exportService, /export async function exportPDF/);
});

test("Server-side PDF renderer route and Chromium dependencies are removed", async () => {
  const packageJson = await readFile(new URL("../../package.json", import.meta.url), "utf8");

  await assert.rejects(
    readFile(new URL("../../api/pdf.js", import.meta.url), "utf8"),
    /ENOENT/
  );

  assert.doesNotMatch(packageJson, /puppeteer-core/);
  assert.doesNotMatch(packageJson, /@sparticuz\/chromium-min/);
});
