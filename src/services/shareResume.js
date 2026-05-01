export function createShareToken() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID().replace(/-/g, "");
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;
}

export function buildSharedResumePath(token) {
  return `/shared/${token}`;
}

export function buildSharedResumeUrl(origin, token) {
  return `${origin}${buildSharedResumePath(token)}`;
}
