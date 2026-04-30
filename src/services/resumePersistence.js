export function getResumeBuilderStep(resume) {
  if (!resume) return 1;
  if (resume.status === "complete" || resume.resumeData) return 5;
  if (resume.templateId) return 4;
  if (hasText(resume.bragSheetText) || hasText(resume.bragSheetFileName)) return 3;
  if (hasText(resume.targetRole) || hasText(resume.interviewAnswers?.targetRole)) return 2;
  return 1;
}

export function mergeCachedAndServerResumes(serverResumes, cachedResumes) {
  const server = Array.isArray(serverResumes) ? serverResumes : [];
  const cached = Array.isArray(cachedResumes) ? cachedResumes : [];

  if (server.length === 0) return cached;

  const cachedById = new Map(cached.map((resume) => [resume.id, resume]));
  const mergedServer = server.map((resume) =>
    mergeCachedAndServerResume(resume, cachedById.get(resume.id))
  );
  const serverIds = new Set(server.map((resume) => resume.id));
  const unsyncedCached = cached.filter((resume) => !serverIds.has(resume.id));

  return [...mergedServer, ...unsyncedCached].sort(
    (a, b) => getUpdatedAt(b) - getUpdatedAt(a)
  );
}

export function mergeCachedAndServerResume(serverResume, cachedResume) {
  if (!serverResume) return cachedResume ?? null;
  if (!cachedResume) return serverResume;

  const cachedIsNewer = getUpdatedAt(cachedResume) > getUpdatedAt(serverResume);
  return cachedIsNewer ? cachedResume : serverResume;
}

export function buildResumeWriteData(existingResume, data) {
  return {
    ...(existingResume?.userId ? { userId: existingResume.userId } : {}),
    ...data,
  };
}

function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getUpdatedAt(resume) {
  const value = resume?.updatedAt;
  if (typeof value === "number") return value;
  if (typeof value?.toMillis === "function") return value.toMillis();
  return 0;
}
