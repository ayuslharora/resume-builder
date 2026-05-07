import { buildResumeTextForAts } from "./resumeTextForAts.js";

const SHARED_RESUME_PATTERN = /^\/shared\/([^/?#]+)/;

export function extractShareTokenFromResumeLink(value) {
  const rawValue = value.trim();
  if (!rawValue) return "";

  try {
    const url = new URL(rawValue, "https://resume.ayuslh.in");
    const match = url.pathname.match(SHARED_RESUME_PATTERN);
    return match ? decodeURIComponent(match[1]) : "";
  } catch {
    return "";
  }
}

export function buildSharedResumeGradeSource(resume) {
  if (!resume) {
    throw new Error("Resume not found.");
  }

  if (!resume.isShared) {
    throw new Error("This resume is not published.");
  }

  const text = buildResumeTextForAts(resume.resumeData || {});
  if (!text.trim()) {
    throw new Error("This shared resume does not contain enough text to grade.");
  }

  return {
    text,
    fileName: `${resume.title || "Shared Resume"} (ResuMe link)`,
    metadata: {
      extractionMethod: "shared-resume-data",
      usedOcr: false,
      extractionWarning: null,
      confidence: {
        label: "High",
        score: 96,
        note: "This grade used selectable resume text from ResuMe data, so OCR was not needed.",
      },
    },
  };
}
