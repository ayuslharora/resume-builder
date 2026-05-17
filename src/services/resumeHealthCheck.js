import { stripResumeHtml } from "./resumeHtmlSanitizer";

function wordCount(html) {
  return stripResumeHtml(html || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export function runHealthChecks(resumeData = {}) {
  const issues = [];
  const pi = resumeData.personalInfo || {};

  // ── Contact info ──────────────────────────────────────────────────────────
  if (!stripResumeHtml(pi.fullName || "").trim()) {
    issues.push({
      id: "missing-name",
      severity: "error",
      section: "personalInfo",
      message: "Full name is missing",
      suggestion: "Add your full name so recruiters know whose resume this is.",
    });
  }

  if (!pi.email?.trim()) {
    issues.push({
      id: "missing-email",
      severity: "error",
      section: "personalInfo",
      message: "Email address is missing",
      suggestion: "Recruiters need an email to reach you.",
    });
  }

  if (!pi.phone?.trim()) {
    issues.push({
      id: "missing-phone",
      severity: "warning",
      section: "personalInfo",
      message: "Phone number is missing",
      suggestion: "Most recruiters expect a phone number on a resume.",
    });
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const summaryText = stripResumeHtml(resumeData.summary || "").trim();
  if (!summaryText) {
    issues.push({
      id: "missing-summary",
      severity: "warning",
      section: "summary",
      message: "Professional summary is empty",
      suggestion: "A 2–3 sentence summary helps recruiters quickly understand your profile.",
    });
  } else {
    const wc = wordCount(resumeData.summary);
    if (wc > 30) {
      issues.push({
        id: "summary-too-long",
        severity: "suggestion",
        section: "summary",
        message: `Summary is ${wc} words — recommended under 30`,
        suggestion: "Shorten to 2–3 impactful sentences. Use the AI shorten button for a quick rewrite.",
        canAifix: true,
      });
    }
  }

  // ── Experience ────────────────────────────────────────────────────────────
  if (!(resumeData.experience || []).length) {
    issues.push({
      id: "missing-experience",
      severity: "warning",
      section: "experience",
      message: "No work experience entries",
      suggestion: "Add at least one role, internship, or freelance project.",
    });
  }

  // ── Education ─────────────────────────────────────────────────────────────
  if (!(resumeData.education || []).length) {
    issues.push({
      id: "missing-education",
      severity: "warning",
      section: "education",
      message: "No education entries",
      suggestion: "Add your highest degree or current enrollment.",
    });
  }

  // ── Projects missing links ────────────────────────────────────────────────
  const projectsMissingLink = (resumeData.projects || []).filter(
    (p) => stripResumeHtml(p.name || "").trim() && !p.link?.trim()
  );
  if (projectsMissingLink.length > 0) {
    issues.push({
      id: "projects-no-link",
      severity: "suggestion",
      section: "projects",
      message: `${projectsMissingLink.length} project${projectsMissingLink.length > 1 ? "s" : ""} missing a live link or GitHub URL`,
      suggestion: "Links let recruiters verify your work. Even a GitHub repo URL helps.",
    });
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  const tech = resumeData.skills?.technical || [];
  const soft = resumeData.skills?.soft || [];
  if (!tech.length && !soft.length) {
    issues.push({
      id: "missing-skills",
      severity: "warning",
      section: "skills",
      message: "No skills listed",
      suggestion: "Add technical and soft skills to improve ATS keyword matching.",
    });
  }

  return issues;
}

export function issuesBySeverity(issues) {
  return {
    errors: issues.filter((i) => i.severity === "error"),
    warnings: issues.filter((i) => i.severity === "warning"),
    suggestions: issues.filter((i) => i.severity === "suggestion"),
  };
}
