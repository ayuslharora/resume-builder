export const MAX_LLM_PAYLOAD_CHARS = 120000;

export class LlmTaskError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "LlmTaskError";
    this.statusCode = statusCode;
  }
}

function limitText(value, maxChars = 20000) {
  const text = typeof value === "string" ? value : "";
  return text.length > maxChars ? text.slice(0, maxChars) : text;
}

function stringifyForPrompt(value, maxChars = 30000) {
  let text = "";
  try {
    text = JSON.stringify(value ?? null, null, 2);
  } catch {
    text = "null";
  }
  return limitText(text, maxChars);
}

function enforcePayloadSize(payload) {
  let serialized = "";
  try {
    serialized = JSON.stringify(payload ?? {});
  } catch {
    throw new LlmTaskError("Invalid AI request payload.", 400);
  }

  if (serialized.length > MAX_LLM_PAYLOAD_CHARS) {
    throw new LlmTaskError("AI request payload is too large.", 413);
  }
}

function contextFrom(payload = {}) {
  return payload.targetContext && typeof payload.targetContext === "object"
    ? payload.targetContext
    : {};
}

function onePageRules(isOnePage) {
  if (!isOnePage) {
    return `TWO-PAGE GOAL:
The candidate is comfortable with two pages. Be thorough but still concise and focused on the target role.`;
  }

  return `ONE-PAGE HARD LIMIT - this is the most critical constraint:
The output MUST fit on a single A4 page. Violating this is worse than omitting content.
- Summary: maximum 50 words. 2-3 punchy sentences only.
- Every bullet: maximum 20 words. One clause. Strong action verb. No filler.
- Experience: maximum 4 entries. Maximum 4 bullets each - prefer 3.
- Projects: maximum 3 entries. Maximum 3 bullets each - prefer 2.
- Skills: maximum 8 technical skills, 4 soft skills. Only include skills relevant to the role.
- Omit achievements, languages, and extracurriculars entirely unless they are directly critical to the role.
- When two items are equivalent in relevance, always drop the weaker one.
- If in doubt between more content and fitting on one page: always choose fitting on one page.`;
}

function keywordRules(hasJobDescription) {
  if (!hasJobDescription) {
    return `KEYWORD SELECTION:
Focus on skills and keywords that directly support the target role. Do not include every skill from the brag sheet - be selective and relevant.`;
  }

  return `KEYWORD SELECTION - CRITICAL:
You have been given a Job Description (JD). You MUST:
- Read the JD carefully and identify the skills, tools, and technologies that are EXPLICITLY mentioned or clearly implied.
- In the "skills" section, include ONLY skills that (a) appear in the JD and (b) are genuinely present in the candidate's background. Do NOT dump every skill from the brag sheet.
- In bullets, weave in JD-relevant keywords naturally where the candidate's experience supports it.
- Omit skills and technologies that are not relevant to this specific role, even if the candidate has them.`;
}

function resumeSchema() {
  return `{
  "personalInfo": { "fullName": "string", "email": "string", "phone": "string", "location": "string", "linkedin": "string | null", "github": "string | null", "portfolio": "string | null", "photoURL": "string | null" },
  "summary": "string",
  "skills": { "technical": ["string"], "soft": ["string"] },
  "experience": [ { "id": "uuid-string", "company": "string", "role": "string", "duration": "string", "location": "string", "bullets": ["string"] } ],
  "education": [ { "id": "uuid-string", "institution": "string", "degree": "string", "field": "string", "duration": "string", "cgpa": "string | null", "achievements": ["string"] } ],
  "projects": [ { "id": "uuid-string", "name": "string", "techStack": ["string"], "description": "string", "bullets": ["string"], "link": "string | null" } ],
  "certifications": [ { "id": "uuid-string", "name": "string", "issuer": "string", "date": "string", "link": "string | null" } ],
  "achievements": ["string"],
  "languages": ["string"],
  "extracurriculars": ["string"]
}`;
}

function buildGenerateResume(payload = {}) {
  const interviewAnswers = payload.interviewAnswers && typeof payload.interviewAnswers === "object"
    ? payload.interviewAnswers
    : {};
  const bragSheetText = limitText(payload.bragSheetText, 35000);
  const hasJobDescription = Boolean(interviewAnswers.jobDescription?.trim());
  const isOnePage = interviewAnswers.preferredLength !== "2-pages";

  return {
    systemPrompt: `You are an expert resume writer. You write resumes for students and freshers applying to tech roles.

CRITICAL RULES:
1. Extract and use ONLY information from the candidate's Brag Sheet and interview answers. DO NOT invent experience, projects, education, or skills.
2. If a section has no data, leave it as an empty array. Never fabricate.
3. Output ONLY valid JSON matching the schema. No markdown, no explanation.
4. All bullets start with strong action verbs.
5. Keep every bullet impact-driven and under 20 words.
6. NEVER use em-dashes. Use a hyphen or colon.

${keywordRules(hasJobDescription)}

${onePageRules(isOnePage)}`,
    userPrompt: `Here is the candidate's raw achievements document (Brag Sheet):
---
${bragSheetText || "(No document provided. Base the resume strictly on the interview answers below.)"}
---

Here are their interview answers:
- Target role: ${limitText(interviewAnswers.targetRole, 500)}
- Target company type: ${limitText(interviewAnswers.targetCompanyType, 500)}
- Experience level: ${limitText(interviewAnswers.experienceLevel, 500)}
- Skills to highlight: ${limitText(interviewAnswers.skillsToHighlight, 1000)}
- Career objective: ${limitText(interviewAnswers.careerObjective, 1000)}
- Technologies to emphasize: ${limitText(interviewAnswers.technologiesToEmphasize, 1000)}
- Preferred length: ${limitText(interviewAnswers.preferredLength, 100)}
- Additional context: ${limitText(interviewAnswers.additionalContext, 2000)}
${hasJobDescription ? `\nJob Description to tailor this resume for:\n---\n${limitText(interviewAnswers.jobDescription, 12000)}\n---` : ""}

Generate a complete resume as JSON following this exact schema:
${resumeSchema()}

Ensure all IDs are unique string UUIDs. Output ONLY the JSON object.`,
    options: { temperature: 0, top_p: 1, max_tokens: 4096 },
  };
}

function buildRegenerateSection(payload = {}) {
  const sectionName = limitText(payload.sectionName, 80);
  const context = contextFrom(payload);
  const bragSheetText = limitText(payload.bragSheetText, 25000);
  const customInstruction = limitText(payload.customInstruction, 2000);

  return {
    systemPrompt: `You are an expert resume writer.
Rewrite the "${sectionName}" section of this resume.

CRITICAL INSTRUCTIONS:
1. SEMANTIC CONTINUITY: You MUST preserve the core facts and value of the original content.
2. If the user provides a "USER INSTRUCTION", prioritize it.
3. When asked for more info, use the provided Brag Sheet if any. DO NOT invent fake experiences.
4. Output ONLY valid JSON in the exact following format:
{
  "${sectionName}": <updated data>
}
5. The updated data MUST strictly match the original schema and structure.
6. NEVER use em-dashes. Use regular hyphens or colons.
7. LENGTH CONSTRAINTS - the resume must stay on ONE page:
   - Every bullet point: maximum 20 words. One clause. No compound sentences.
   - Summary field: maximum 50 words.
   - Experience bullets: maximum 4 bullets per entry.
   - Project bullets: maximum 3 bullets per entry.
   - If a USER INSTRUCTION asks for more bullets, add at most 1 extra bullet beyond the current count.
No explanation.`,
    userPrompt: `Current section data: ${stringifyForPrompt(payload.currentSectionData)}

${bragSheetText ? `Candidate's Raw Background (Brag Sheet):
${bragSheetText}` : ""}

Context: ${limitText(context.targetRole, 500) || "general role"} at ${limitText(context.targetCompanyType, 500) || "general"} company.

${customInstruction ? `USER INSTRUCTION (PRIORITY):
${customInstruction}` : "Improve this section for better impact and clarity while maintaining all facts."}`,
    options: { temperature: 0.2, top_p: 1, max_tokens: 2200 },
  };
}

function buildRegenerateItem(payload = {}) {
  const sectionName = limitText(payload.sectionName, 80);
  const context = contextFrom(payload);
  const bragSheetText = limitText(payload.bragSheetText, 25000);
  const customInstruction = limitText(payload.customInstruction, 2000);

  return {
    systemPrompt: `You are an expert resume writer.
Rewrite ONLY this single item from the "${sectionName}" section of the candidate's resume.
Context about the candidate: ${limitText(context.targetRole, 500) || "general role"} applying to ${limitText(context.targetCompanyType, 500) || "general"} company.
${bragSheetText ? `\nCandidate's Raw Background/Brag Sheet (Draw facts from here. DO NOT invent details):\n${bragSheetText}\n` : ""}${customInstruction ? `\nUSER INSTRUCTION: ${customInstruction}\n` : ""}
CRITICAL RULES:
- NEVER use em-dashes. Use regular hyphens or colons instead.
- Do NOT invent new experiences. Improve wording, impact, and formatting only.
- LENGTH CONSTRAINTS - resume must fit on ONE page:
  - Every bullet: maximum 20 words, one clause, strong action verb at start.
  - Maximum 4 bullets for experience entries; maximum 3 for project entries.
  - Do NOT add more bullets than already exist in the original item.
Output ONLY valid JSON representing the updated item. Keep the same schema and keep "id" unchanged.
No explanation.`,
    userPrompt: `Current item data: ${stringifyForPrompt(payload.currentItemData)}`,
    options: { temperature: 0.2, top_p: 1, max_tokens: 1800 },
  };
}

function buildExtractBasicInfo(payload = {}) {
  return {
    systemPrompt: `Extract the following from this document and return as JSON:
{ "targetRole": "string | null", "skills": ["string"] | null, "name": "string | null" }
Output ONLY JSON.`,
    userPrompt: `Document: ${limitText(payload.bragSheetText, 25000)}`,
    options: { temperature: 0, top_p: 1, max_tokens: 800 },
  };
}

function buildGradeResume(payload = {}) {
  const context = contextFrom(payload);
  const resumeText = limitText(payload.resumeText, 35000);

  return {
    systemPrompt: `You are an expert ATS optimizer, recruiter, hiring manager, and resume coach.
Review the resume against the candidate's stated target job.
Be concrete, practical, and critical without being vague.
Favor actionable edits over generic advice.
Return ONLY valid JSON matching this schema:
{
  "score": number,
  "summary": "string",
  "fitAssessment": "string",
  "atsBreakdown": { "formatting": number, "keywords": number, "impact": number, "clarity": number },
  "sectionScores": [{ "section": "string", "score": number, "reason": "string" }],
  "strengths": ["string"],
  "priorityFixes": [{ "issue": "string", "whyItMatters": "string", "howToFix": "string" }],
  "keywordGaps": ["string"],
  "keywordPlacementSuggestions": [{ "keyword": "string", "targetSection": "string", "howToAdd": "string", "example": "string" }],
  "weakBullets": [{ "originalBullet": "string", "section": "string", "issue": "string", "priority": "high | medium | low" }],
  "sectionFeedback": [{ "section": "string", "assessment": "string", "changes": ["string"] }],
  "rewriteSuggestions": [{ "original": "string", "improved": "string", "reason": "string" }],
  "atsRisks": [{ "risk": "string", "severity": "low | medium | high", "details": "string" }],
  "jobMatch": { "matchedRequirements": ["string"], "partialMatches": ["string"], "missingEvidence": ["string"] },
  "tonePerspective": "string"
}

Rules:
1. All scores are integers from 0 to 100.
2. Keep every list item specific to the actual resume and target role.
3. If the target role or job description suggests missing keywords, call them out explicitly.
4. "priorityFixes" should be the highest-impact changes first.
5. "rewriteSuggestions" should be short before/after style edits the candidate can apply immediately.
6. "sectionScores" should cover at least Summary, Skills, Experience, Projects, and Education when relevant.
7. "jobMatch" must compare the resume against the target role or job description directly.
8. "tonePerspective" should reflect the selected review lens.
9. "weakBullets" should identify the weakest resume bullets or bullet-like lines worth rewriting first.`,
    userPrompt: `Target role: ${limitText(context.targetRole, 500) || "Not provided"}
Target job description or notes: ${limitText(context.jobDescription, 12000) || "Not provided"}
Review tone: ${limitText(context.reviewTone, 200) || "ATS strict"}

Resume text:
${resumeText}`,
    options: { temperature: 0, top_p: 1, max_tokens: 3200 },
  };
}

function buildRewriteResumeBullet(payload = {}) {
  const context = contextFrom(payload);

  return {
    systemPrompt: `You are an expert resume writer.
Your task is to rewrite one resume bullet point.

CRITICAL INSTRUCTIONS:
1. SEMANTIC CONTINUITY: You MUST preserve the core meaning, factual content, and value of the "Original Bullet".
2. DO NOT drift into unrelated topics.
3. If the user provides a "USER INSTRUCTION", apply that specific change WITHOUT losing the underlying facts.
4. DO NOT invent new metrics, tools, or responsibilities.
5. Return ONLY valid JSON matching this schema:
{
  "rewrites": [
    {
      "version": "The full rewritten bullet point text. This MUST be the actual content.",
      "focus": "A 2-3 word short title/label for this variation.",
      "whyItWorks": "A brief explanation of the improvement."
    }
  ]
}

Rules:
1. Provide exactly 3 rewrites.
2. Each version must be a single, complete bullet line.
3. CONCISENESS: Maximum 20 words per rewrite. One clause only. High impact, zero filler.
4. NEVER swap the version and focus fields.
5. Use strong action verbs.`,
    userPrompt: `Target role: ${limitText(context.targetRole, 500) || "Not provided"}
Target job description or notes: ${limitText(context.jobDescription, 12000) || "Not provided"}

Original bullet:
${limitText(payload.originalBullet, 3000)}

Relevant resume context:
${limitText(context.resumeText, 20000) || "Not provided"}
${context.sourceDocumentText ? `\nRelevant source document context:\n${limitText(context.sourceDocumentText, 25000)}` : ""}

${context.customInstruction ? `USER INSTRUCTION (PRIORITY):
${limitText(context.customInstruction, 2000)}` : "Improve this bullet for maximum impact and ATS compatibility."}`,
    options: { temperature: 0.3, top_p: 1, max_tokens: 1400 },
  };
}

function buildImproveResume(payload = {}) {
  const context = contextFrom(payload);

  return {
    systemPrompt: `You are an expert resume writer improving an existing resume for a specific target role.
You must keep the candidate truthful and only use evidence from the supplied resume text, source document, and job notes.
Do not invent employers, degrees, projects, dates, or metrics.
Return ONLY valid JSON matching this schema:
${resumeSchema()}

Rules:
1. Improve wording, ordering, summaries, and bullets for the target role.
2. Preserve only supported facts from the source text.
3. LENGTH CONSTRAINTS - the output must fit on ONE page when printed:
   - Summary: maximum 50 words.
   - Every bullet: maximum 20 words, one clause, strong action verb at start.
   - Experience bullets: maximum 4 per entry. Prefer 3.
   - Project bullets: maximum 3 per entry. Prefer 2.
   - Skills: keep lists tight - no more than 8 technical skills, 4 soft skills.
   - Omit achievements, languages, extracurriculars unless directly relevant.
4. Ensure all IDs are unique UUID strings.
5. Output only the JSON object.`,
    userPrompt: `Target role: ${limitText(context.targetRole, 500) || "Not provided"}
Target job description or notes: ${limitText(context.jobDescription, 12000) || "Not provided"}
Review tone: ${limitText(context.reviewTone, 200) || "ATS strict"}

Current resume text:
${limitText(context.rewrittenResumeText || payload.resumeText, 35000)}
${context.sourceDocumentText ? `\n\nCandidate's raw background/source document (use this to recover concrete facts and stronger details, but do not invent anything beyond it):\n${limitText(context.sourceDocumentText, 35000)}` : ""}`,
    options: { temperature: 0.2, top_p: 1, max_tokens: 4096 },
  };
}

function buildGenerateCoverLetter(payload = {}) {
  return {
    systemPrompt: `You are an expert career coach and executive resume writer.
Your task is to write a highly professional, compelling, and tailored cover letter for the candidate.
You will be provided with the candidate's resume data and the target Job Description.

CRITICAL RULES:
1. Write in a confident, professional, and natural tone.
2. Start with a strong hook that highlights a key relevant achievement.
3. Draw DIRECT connections between the candidate's actual experience/skills and the job description.
4. DO NOT invent or hallucinate experience, metrics, or skills.
5. Format the output with clear paragraphs.
6. The letter should be exactly 3 to 4 paragraphs long.
7. Return ONLY a valid JSON object matching this schema:
{
  "coverLetter": "The full text of the cover letter with paragraphs separated by double newlines (\\n\\n)"
}
Output only the JSON. Do not include markdown formatting or explanations.`,
    userPrompt: `Candidate's Resume Data:
${stringifyForPrompt(payload.resumeData, 35000)}

Target Job Description:
${limitText(payload.jobDescription, 12000) || "Not provided (Write a strong general cover letter based on their most recent role)."}`,
    options: { temperature: 0.3, top_p: 1, max_tokens: 1800 },
  };
}

const TASK_BUILDERS = {
  generateResume: buildGenerateResume,
  regenerateSection: buildRegenerateSection,
  regenerateItem: buildRegenerateItem,
  extractBasicInfo: buildExtractBasicInfo,
  gradeResume: buildGradeResume,
  rewriteResumeBullet: buildRewriteResumeBullet,
  improveResume: buildImproveResume,
  generateCoverLetter: buildGenerateCoverLetter,
};

export function buildLlmTaskRequest(task, payload = {}) {
  if (typeof task !== "string" || !TASK_BUILDERS[task]) {
    throw new LlmTaskError("Unsupported AI task.", 400);
  }

  enforcePayloadSize(payload);
  return TASK_BUILDERS[task](payload);
}
