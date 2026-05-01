import test from "node:test";
import assert from "node:assert/strict";

import { classifyAppError } from "./errorPresentation.js";

test("classifyAppError identifies dynamic import failures and suggests refresh", () => {
  const result = classifyAppError(
    new TypeError(
      "Failed to fetch dynamically imported module: https://resume.ayuslh.in/assets/Builder-JL0ll59L.js"
    )
  );

  assert.equal(result.kind, "chunk-load");
  assert.match(result.title, /update|reload|refresh/i);
  assert.match(result.message, /refresh|latest version/i);
  assert.equal(result.canRetry, true);
});

test("classifyAppError falls back to a generic application error state", () => {
  const result = classifyAppError(new Error("Something unexpected happened"));

  assert.equal(result.kind, "generic");
  assert.match(result.title, /unexpected|problem/i);
  assert.equal(result.canRetry, true);
});
