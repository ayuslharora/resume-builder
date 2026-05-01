function pushLine(lines, value) {
  if (typeof value === "string" && value.trim()) {
    lines.push(value.trim());
  }
}

function pushSection(lines, title, values) {
  const sectionLines = values.filter(Boolean);
  if (sectionLines.length === 0) return;
  lines.push(title);
  lines.push(...sectionLines);
  lines.push("");
}

export function buildResumeTextForAts(resumeData = {}) {
  const lines = [];
  const personalInfo = resumeData.personalInfo || {};

  pushLine(lines, personalInfo.fullName);
  pushLine(
    lines,
    [
      personalInfo.email,
      personalInfo.phone,
      personalInfo.location,
      personalInfo.linkedin,
      personalInfo.github,
      personalInfo.portfolio,
    ].filter(Boolean).join(" | ")
  );
  if (lines.length > 0) lines.push("");

  pushSection(lines, "Summary", [resumeData.summary]);

  const skills = resumeData.skills || {};
  pushSection(lines, "Skills", [
    Array.isArray(skills.technical) && skills.technical.length > 0
      ? `Technical: ${skills.technical.join(", ")}`
      : "",
    Array.isArray(skills.soft) && skills.soft.length > 0
      ? `Soft: ${skills.soft.join(", ")}`
      : "",
  ]);

  pushSection(
    lines,
    "Experience",
    (resumeData.experience || []).flatMap((item) => {
      const itemLines = [
        [item.role, item.company].filter(Boolean).join(" - "),
        [item.duration, item.location].filter(Boolean).join(" | "),
        ...((item.bullets || []).map((bullet) => `- ${bullet}`)),
      ].filter(Boolean);
      return itemLines.length > 0 ? [...itemLines, ""] : [];
    })
  );

  pushSection(
    lines,
    "Education",
    (resumeData.education || []).flatMap((item) => {
      const itemLines = [
        [item.degree, item.field].filter(Boolean).join(" in "),
        item.institution,
        [item.duration, item.cgpa ? `GPA: ${item.cgpa}` : ""].filter(Boolean).join(" | "),
        ...((item.achievements || []).map((achievement) => `- ${achievement}`)),
      ].filter(Boolean);
      return itemLines.length > 0 ? [...itemLines, ""] : [];
    })
  );

  pushSection(
    lines,
    "Projects",
    (resumeData.projects || []).flatMap((item) => {
      const itemLines = [
        item.name,
        Array.isArray(item.techStack) && item.techStack.length > 0 ? item.techStack.join(", ") : "",
        item.description,
        ...((item.bullets || []).map((bullet) => `- ${bullet}`)),
        item.link,
      ].filter(Boolean);
      return itemLines.length > 0 ? [...itemLines, ""] : [];
    })
  );

  pushSection(
    lines,
    "Certifications",
    (resumeData.certifications || []).flatMap((item) => {
      const itemLines = [
        item.name,
        [item.issuer, item.date].filter(Boolean).join(" | "),
        item.link,
      ].filter(Boolean);
      return itemLines.length > 0 ? [...itemLines, ""] : [];
    })
  );

  pushSection(lines, "Achievements", (resumeData.achievements || []).map((item) => `- ${item}`));
  pushSection(lines, "Languages", [
    Array.isArray(resumeData.languages) && resumeData.languages.length > 0
      ? resumeData.languages.join(", ")
      : "",
  ]);
  pushSection(lines, "Extracurriculars", (resumeData.extracurriculars || []).map((item) => `- ${item}`));

  return lines.join("\n").trim();
}
