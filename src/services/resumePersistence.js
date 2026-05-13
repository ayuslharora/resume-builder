export function getResumeBuilderStep(resume) {
  if (!resume) return 1;
  if (resume.status === "complete" || resume.resumeData) return 5;
  if (resume.templateId) return 4;
  if (hasText(resume.bragSheetText) || hasText(resume.bragSheetFileName)) return 3;
  if (hasText(resume.targetRole) || hasText(resume.interviewAnswers?.targetRole)) return 2;
  return 1;
}

export function buildResumeWriteData(existingResume, data) {
  const {
    userId: _incomingUserId,
    createdAt: _incomingCreatedAt,
    ...rest
  } = data ?? {};

  return {
    ...(existingResume?.userId ? { userId: existingResume.userId } : {}),
    ...(existingResume?.createdAt ? { createdAt: existingResume.createdAt } : {}),
    ...rest,
  };
}

export function normalizeResumeTitle(title, fallback = "Untitled Resume") {
  const normalized = typeof title === "string" ? title.trim() : "";
  return normalized || fallback;
}

export function buildResumeTitleUpdate(title) {
  return {
    title: normalizeResumeTitle(title),
  };
}

export function getUserResumeQueryConstraints(whereFn, userId) {
  return [whereFn("userId", "==", userId)];
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}
