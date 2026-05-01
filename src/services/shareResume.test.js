import test from "node:test";
import assert from "node:assert/strict";

import { buildSharedResumePath, createShareToken } from "./shareResume.js";

test("createShareToken returns a URL-safe token", () => {
  const token = createShareToken();

  assert.match(token, /^[a-zA-Z0-9_-]{16,}$/);
});

test("buildSharedResumePath uses token route", () => {
  assert.equal(buildSharedResumePath("abc123"), "/shared/abc123");
});
