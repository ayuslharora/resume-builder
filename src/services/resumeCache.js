/**
 * resumeCache.js
 *
 * A thin localStorage layer that mirrors Firestore resume data locally.
 * Strategy:
 *   - Resume list  →  "rf_resumes_{userId}"        (array of resume metadata)
 *   - Resume data  →  "rf_resume_{resumeId}"        (full individual resume document)
 *
 * The app always reads localStorage first (instant), then overwrites with
 * whatever Firebase returns so the user gets fresh data without a blank screen.
 */

const LIST_KEY  = (uid)  => `rf_resumes_${uid}`;
const ITEM_KEY  = (id)   => `rf_resume_${id}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    // Storage quota exceeded — silently ignore
    console.warn("resumeCache: localStorage write failed", e);
  }
}

// ─── Resume List ──────────────────────────────────────────────────────────────

/**
 * Return the cached list of resumes for a user, or [] if nothing cached.
 */
export function getCachedResumeList(userId) {
  return safeGet(LIST_KEY(userId)) ?? [];
}

/**
 * Persist the full resume list for a user (called after every Firebase snapshot).
 * Firestore Timestamps are not JSON-serialisable, so we strip them and use
 * ISO strings instead.
 */
export function setCachedResumeList(userId, resumes) {
  const serialisable = resumes.map(serializeResume);
  safeSet(LIST_KEY(userId), serialisable);
}

/**
 * Upsert a single resume entry in the cached list.
 * Used when we create / update a resume so the list stays in sync
 * without needing a full Firebase snapshot.
 */
export function upsertCachedResumeInList(userId, resume) {
  const list = getCachedResumeList(userId);
  const idx  = list.findIndex(r => r.id === resume.id);
  const entry = serializeResume(resume);
  if (idx >= 0) {
    list[idx] = entry;
  } else {
    list.unshift(entry);          // new items go to the front (most-recent first)
  }
  // Keep list sorted by updatedAt desc
  list.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  safeSet(LIST_KEY(userId), list);
}

/**
 * Remove a resume entry from the cached list.
 */
export function removeCachedResumeFromList(userId, resumeId) {
  const list = getCachedResumeList(userId).filter(r => r.id !== resumeId);
  safeSet(LIST_KEY(userId), list);
}

// ─── Individual Resume ────────────────────────────────────────────────────────

/**
 * Return the full cached resume document, or null if not found.
 */
export function getCachedResume(resumeId) {
  return safeGet(ITEM_KEY(resumeId));
}

/**
 * Persist (or overwrite) a full resume document.
 */
export function setCachedResume(resumeId, data) {
  safeSet(ITEM_KEY(resumeId), serializeResume({ ...data, id: resumeId }));
}

/**
 * Remove a resume's individual cache entry (on delete).
 */
export function removeCachedResume(resumeId) {
  try {
    localStorage.removeItem(ITEM_KEY(resumeId));
  } catch { /* ignore */ }
}

// ─── Serialisation ────────────────────────────────────────────────────────────

/**
 * Convert Firestore Timestamps / Date objects to milliseconds so they can be
 * JSON-stringified and later compared numerically for sorting.
 */
function serializeResume(resume) {
  return {
    ...resume,
    createdAt: toMs(resume.createdAt),
    updatedAt: toMs(resume.updatedAt) ?? Date.now(),
  };
}

function toMs(value) {
  if (!value) return null;
  if (typeof value === "number") return value;
  if (typeof value.toMillis === "function") return value.toMillis();   // Firestore Timestamp
  if (value instanceof Date) return value.getTime();
  return null;
}
