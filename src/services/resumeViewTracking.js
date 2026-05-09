const VIEWER_ID_KEY = "resumeforge_resume_viewer_id";

export function getOrCreateResumeViewerId() {
  if (typeof window === "undefined") return "";

  try {
    const existing = window.localStorage.getItem(VIEWER_ID_KEY);
    if (existing) return existing;

    const nextId = createViewerId();
    window.localStorage.setItem(VIEWER_ID_KEY, nextId);
    return nextId;
  } catch {
    return createViewerId();
  }
}

function createViewerId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}
