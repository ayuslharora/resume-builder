const STORAGE_KEY = "resumeforge_grader_history";
const MAX_HISTORY = 12;

export function getGraderHistory() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Failed to read grader history:", err);
    return [];
  }
}

export function addGraderHistoryEntry(entry) {
  if (typeof window === "undefined") return [];

  const current = getGraderHistory();
  const next = [entry, ...current].slice(0, MAX_HISTORY);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.warn("Failed to save grader history:", err);
  }

  return next;
}
