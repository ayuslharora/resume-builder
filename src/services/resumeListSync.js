const RESUME_DELETED_EVENT = "resume:deleted";

export function notifyResumeDeleted(resumeId) {
  if (!resumeId || typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent(RESUME_DELETED_EVENT, {
      detail: { resumeId },
    })
  );
}

export function subscribeToResumeDeleted(callback) {
  if (typeof window === "undefined" || typeof callback !== "function") {
    return () => {};
  }

  function handleResumeDeleted(event) {
    const deletedResumeId = event.detail?.resumeId;
    if (deletedResumeId) {
      callback(deletedResumeId);
    }
  }

  window.addEventListener(RESUME_DELETED_EVENT, handleResumeDeleted);
  return () => window.removeEventListener(RESUME_DELETED_EVENT, handleResumeDeleted);
}
