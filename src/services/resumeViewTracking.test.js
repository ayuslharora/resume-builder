import test from "node:test";
import assert from "node:assert/strict";

import { getOrCreateResumeViewerId } from "./resumeViewTracking.js";

test("getOrCreateResumeViewerId reuses a browser-scoped anonymous id", () => {
  const store = new Map();
  const originalWindow = globalThis.window;

  globalThis.window = {
    localStorage: {
      getItem: (key) => store.get(key) || null,
      setItem: (key, value) => store.set(key, value),
    },
  };

  try {
    const first = getOrCreateResumeViewerId();
    const second = getOrCreateResumeViewerId();

    assert.ok(first);
    assert.equal(second, first);
  } finally {
    if (originalWindow === undefined) {
      delete globalThis.window;
    } else {
      globalThis.window = originalWindow;
    }
  }
});
