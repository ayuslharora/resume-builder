import test from "node:test";
import assert from "node:assert/strict";

import { sanitizeRewriteOption } from "./rewriteOptionSanitizer.js";

test("sanitizeRewriteOption strips leaked headings and why-it-works text from the inserted bullet", () => {
  const sanitized = sanitizeRewriteOption({
    version: "Technical Focus 1\n↳ Demonstrated expertise in computer vision, hand-tracking, and real-time processing with OpenCV and MediaPipe.",
    focus: "Technical Focus 1",
    whyItWorks: "Highlights technical depth.",
  });

  assert.equal(
    sanitized.version,
    "Demonstrated expertise in computer vision, hand-tracking, and real-time processing with OpenCV and MediaPipe."
  );
});

test("sanitizeRewriteOption preserves clean single-line bullets", () => {
  const sanitized = sanitizeRewriteOption({
    version: "Built and optimized real-time hand-tracking workflows with OpenCV and MediaPipe.",
    focus: "ATS Keywords",
    whyItWorks: "Keeps it concise.",
  });

  assert.equal(
    sanitized.version,
    "Built and optimized real-time hand-tracking workflows with OpenCV and MediaPipe."
  );
});
