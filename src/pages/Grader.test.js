import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Grader offers upload, pasted text, and ResuMe link grading options", async () => {
  const source = await readFile(new URL("./Grader.jsx", import.meta.url), "utf8");

  assert.match(source, /Select Resume Document/);
  assert.match(source, /Paste Resume Text/);
  assert.match(source, /Paste ResuMe Link/);
  assert.match(source, /getResumeByShareToken/);
  assert.match(source, /buildSharedResumeGradeSource/);
});

test("Grader report uses the tabbed report-style report shell", async () => {
  const source = await readFile(new URL("./Grader.jsx", import.meta.url), "utf8");

  assert.match(source, /REPORT_TABS/);
  assert.match(source, /Overall fit/);
  assert.match(source, /Improve in builder/);
  assert.match(source, /Grade another/);
  assert.match(source, /renderReportTab/);
  assert.match(source, /Sections parsed/);
  assert.match(source, /getReadableSectionLabel/);
  assert.match(source, /renderPriorityLevel/);
});

test("Grader job match cards use a dedicated spacious layout", async () => {
  const source = await readFile(new URL("./Grader.jsx", import.meta.url), "utf8");

  assert.match(source, /grader-match-grid/);
  assert.match(source, /grader-match-card-body/);
  assert.match(source, /MatchRequirementList/);
  assert.match(source, /grader-match-list/);
  assert.doesNotMatch(
    source,
    /Matched requirements[\s\S]{0,220}<KeywordPillList/
  );
});

test("Grader required-role error has a dark theme error color token", async () => {
  const graderSource = await readFile(new URL("./Grader.jsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../index.css", import.meta.url), "utf8");
  const darkThemeBlock = cssSource.match(/body\[data-theme="dark"\] \.app-design \{[\s\S]*?\n\s{2}\}/)?.[0] || "";

  assert.match(graderSource, /Add the job or role you are targeting/);
  assert.match(graderSource, /background: "var\(--bad-soft\)"/);
  assert.match(darkThemeBlock, /--bad-soft:/);
});

test("Grader report status badges have dark theme status color tokens", async () => {
  const graderSource = await readFile(new URL("./Grader.jsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../index.css", import.meta.url), "utf8");
  const darkThemeBlock = cssSource.match(/body\[data-theme="dark"\] \.app-design \{[\s\S]*?\n\s{2}\}/)?.[0] || "";

  assert.match(graderSource, /Sections parsed/);
  assert.match(graderSource, /Tone matches lens/);
  assert.match(graderSource, /missing keywords/);
  assert.match(graderSource, /background: "var\(--good-soft\)"/);
  assert.match(darkThemeBlock, /--good-soft:/);
  assert.match(darkThemeBlock, /--good:/);
  assert.match(darkThemeBlock, /--warn-soft:/);
  assert.match(darkThemeBlock, /--warn:/);
});
