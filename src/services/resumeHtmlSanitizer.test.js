import test from "node:test";
import assert from "node:assert/strict";

import {
  sanitizeResumeHtml,
  stripResumeHtml,
} from "./resumeHtmlSanitizer.js";

test("sanitizeResumeHtml removes executable resume HTML but keeps safe formatting", () => {
  const payload = `
    <strong>Built dashboards</strong>
    <img src=x onerror="alert(1)">
    <script>alert(2)</script>
    <svg onload="alert(3)"><circle /></svg>
    <a href="javascript:alert(4)">bad link</a>
    <span style="background:url(javascript:alert(5))">styled</span>
    <ul onclick="alert(6)"><li data-x="bad">Kept bullet</li></ul>
  `;

  const sanitized = sanitizeResumeHtml(payload);

  assert.match(sanitized, /<strong>Built dashboards<\/strong>/);
  assert.match(sanitized, /<ul><li>Kept bullet<\/li><\/ul>/);
  assert.doesNotMatch(sanitized, /<img/i);
  assert.doesNotMatch(sanitized, /<script/i);
  assert.doesNotMatch(sanitized, /<svg/i);
  assert.doesNotMatch(sanitized, /javascript:/i);
  assert.doesNotMatch(sanitized, /onerror|onload|onclick/i);
  assert.doesNotMatch(sanitized, /style=/i);
  assert.doesNotMatch(sanitized, /data-x=/i);
});

test("stripResumeHtml returns readable text for empty checks and AI rewrite prompts", () => {
  assert.equal(stripResumeHtml("<b>Impact</b><br><script>bad()</script>"), "Impact");
  assert.equal(stripResumeHtml("<img src=x onerror=bad()>"), "");
  assert.equal(stripResumeHtml("&nbsp; <strong> </strong>"), "");
});
