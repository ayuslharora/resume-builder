const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = `https://api.groq.com/openai/v1/chat/completions`;

async function callGemini(systemPrompt, userPrompt) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    throw new Error(`Groq API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const textContent = data.choices[0].message.content;
  const cleanedText = textContent.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch {
    console.error("Raw response:", textContent);
    throw new Error("Failed to parse Groq JSON output.");
  }
}

export async function generateResume(bragSheetText, interviewAnswers) {
  const systemPrompt = `You are an expert resume writer. You write resumes for students and freshers applying to tech roles.
CRITICAL RULES:
1. You MUST extract and use the information provided in the "raw achievements document" (Brag Sheet).
2. DO NOT make up or hallucinate any work experience, education, projects, or skills that are not supported by the candidate's document or interview answers.
3. If the document is missing certain sections, leave them empty rather than inventing fake data.
4. Your output must be ONLY valid JSON matching the schema precisely. No markdown, no explanation.
5. Write all experience bullets starting with strong action verbs (Led, Built, Developed, Designed, Implemented, Optimized, etc.).
6. Keep bullets impact-driven and concise: under 20 words each.
Tailor the tone and emphasis based on the target company type and role.`;

  const userPrompt = `Here is the candidate's raw achievements document (Brag Sheet):
---
${bragSheetText ? bragSheetText : "(No document provided by the candidate. Base the resume strictly on the interview answers below.)"}
---

Here are their interview answers:
- Target role: ${interviewAnswers.targetRole}
- Target company type: ${interviewAnswers.targetCompanyType}
- Experience level: ${interviewAnswers.experienceLevel}
- Skills to highlight: ${interviewAnswers.skillsToHighlight}
- Career objective: ${interviewAnswers.careerObjective}
- Technologies to emphasize: ${interviewAnswers.technologiesToEmphasize}
- Preferred length: ${interviewAnswers.preferredLength}
- Additional context: ${interviewAnswers.additionalContext}

Generate a complete resume as JSON following this exact schema:
{
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
}

Ensure all IDs are unique string UUIDs. Output ONLY the JSON object.`;

  const result = await callGemini(systemPrompt, userPrompt);
  
  if (!result.personalInfo) result.personalInfo = { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "" };
  if (!result.summary) result.summary = "";
  if (!result.experience) result.experience = [];
  if (!result.education) result.education = [];
  if (!result.projects) result.projects = [];
  if (!result.skills) result.skills = { technical: [], soft: [] };
  if (!result.certifications) result.certifications = [];
  if (!result.achievements) result.achievements = [];
  
  return result;
}

export async function regenerateSection(sectionName, currentSectionData, context) {
  const systemPrompt = `You are an expert resume writer.
Rewrite ONLY the "${sectionName}" section of this resume.
Context about the candidate: ${context.targetRole || 'general role'} applying to ${context.targetCompanyType || 'general'} company.
Output ONLY the updated section as valid JSON. No explanation.`;

  const userPrompt = `Current section data: ${JSON.stringify(currentSectionData)}`;
  return await callGemini(systemPrompt, userPrompt);
}

export async function extractBasicInfo(bragSheetText) {
  const systemPrompt = `Extract the following from this document and return as JSON:
{ "targetRole": "string | null", "skills": ["string"] | null, "name": "string | null" }
Output ONLY JSON.`;
  const userPrompt = `Document: ${bragSheetText}`;
  return await callGemini(systemPrompt, userPrompt);
}

export async function gradeResume(resumeText, targetContext = {}) {
  const systemPrompt = `You are an expert ATS optimizer, recruiter, hiring manager, and resume coach.
Review the resume against the candidate's stated target job.
Be concrete, practical, and critical without being vague.
Favor actionable edits over generic advice.
Return ONLY valid JSON matching this schema:
{
  "score": number,
  "summary": "string",
  "fitAssessment": "string",
  "atsBreakdown": {
    "formatting": number,
    "keywords": number,
    "impact": number,
    "clarity": number
  },
  "sectionScores": [
    {
      "section": "string",
      "score": number,
      "reason": "string"
    }
  ],
  "strengths": ["string"],
  "priorityFixes": [
    {
      "issue": "string",
      "whyItMatters": "string",
      "howToFix": "string"
    }
  ],
  "keywordGaps": ["string"],
  "keywordPlacementSuggestions": [
    {
      "keyword": "string",
      "targetSection": "string",
      "howToAdd": "string",
      "example": "string"
    }
  ],
  "weakBullets": [
    {
      "originalBullet": "string",
      "section": "string",
      "issue": "string",
      "priority": "high | medium | low"
    }
  ],
  "sectionFeedback": [
    {
      "section": "string",
      "assessment": "string",
      "changes": ["string"]
    }
  ],
  "rewriteSuggestions": [
    {
      "original": "string",
      "improved": "string",
      "reason": "string"
    }
  ],
  "atsRisks": [
    {
      "risk": "string",
      "severity": "low | medium | high",
      "details": "string"
    }
  ],
  "jobMatch": {
    "matchedRequirements": ["string"],
    "partialMatches": ["string"],
    "missingEvidence": ["string"]
  },
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
9. "weakBullets" should identify the weakest resume bullets or bullet-like lines worth rewriting first.`;

  const userPrompt = `Target role: ${targetContext.targetRole || "Not provided"}
Target job description or notes: ${targetContext.jobDescription || "Not provided"}
Review tone: ${targetContext.reviewTone || "ATS strict"}

Resume text:
${resumeText}`;

  const result = await callGemini(systemPrompt, userPrompt);

  return {
    score: Number.isFinite(result.score) ? result.score : 0,
    summary: result.summary || "",
    fitAssessment: result.fitAssessment || "",
    atsBreakdown: {
      formatting: Number.isFinite(result?.atsBreakdown?.formatting) ? result.atsBreakdown.formatting : 0,
      keywords: Number.isFinite(result?.atsBreakdown?.keywords) ? result.atsBreakdown.keywords : 0,
      impact: Number.isFinite(result?.atsBreakdown?.impact) ? result.atsBreakdown.impact : 0,
      clarity: Number.isFinite(result?.atsBreakdown?.clarity) ? result.atsBreakdown.clarity : 0,
    },
    sectionScores: Array.isArray(result.sectionScores) ? result.sectionScores : [],
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    priorityFixes: Array.isArray(result.priorityFixes) ? result.priorityFixes : [],
    keywordGaps: Array.isArray(result.keywordGaps) ? result.keywordGaps : [],
    keywordPlacementSuggestions: Array.isArray(result.keywordPlacementSuggestions) ? result.keywordPlacementSuggestions : [],
    weakBullets: Array.isArray(result.weakBullets) ? result.weakBullets : [],
    sectionFeedback: Array.isArray(result.sectionFeedback) ? result.sectionFeedback : [],
    rewriteSuggestions: Array.isArray(result.rewriteSuggestions) ? result.rewriteSuggestions : [],
    atsRisks: Array.isArray(result.atsRisks) ? result.atsRisks : [],
    jobMatch: {
      matchedRequirements: Array.isArray(result?.jobMatch?.matchedRequirements) ? result.jobMatch.matchedRequirements : [],
      partialMatches: Array.isArray(result?.jobMatch?.partialMatches) ? result.jobMatch.partialMatches : [],
      missingEvidence: Array.isArray(result?.jobMatch?.missingEvidence) ? result.jobMatch.missingEvidence : [],
    },
    tonePerspective: result.tonePerspective || "",
  };
}

export async function rewriteResumeBullet(originalBullet, targetContext = {}) {
  const systemPrompt = `You are an expert resume writer.
Rewrite one resume bullet for stronger ATS match and recruiter impact.
Return ONLY valid JSON matching:
{
  "rewrites": [
    {
      "version": "string",
      "focus": "string",
      "whyItWorks": "string"
    }
  ]
}

Rules:
1. Provide exactly 3 rewrites.
2. Keep each rewrite to one bullet line.
3. Do not invent tools, metrics, or responsibilities not supported by the original bullet and surrounding resume context.
4. Make each rewrite distinct in emphasis.`;

  const userPrompt = `Target role: ${targetContext.targetRole || "Not provided"}
Target job description or notes: ${targetContext.jobDescription || "Not provided"}
Review tone: ${targetContext.reviewTone || "ATS strict"}

Original bullet:
${originalBullet}

Relevant resume context:
${targetContext.resumeText || "Not provided"}`;

  const result = await callGemini(systemPrompt, userPrompt);
  return {
    rewrites: Array.isArray(result.rewrites) ? result.rewrites : [],
  };
}

export async function improveResume(resumeText, targetContext = {}) {
  const systemPrompt = `You are an expert resume writer improving an existing resume for a specific target role.
You must keep the candidate truthful and only use evidence from the supplied resume text and job notes.
Do not invent employers, degrees, projects, dates, or metrics.
Return ONLY valid JSON matching this schema:
{
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
}

Rules:
1. Improve wording, ordering, summaries, and bullets for the target role.
2. Preserve only supported facts from the source text.
3. Use concise impact-focused bullets.
4. Ensure all IDs are unique UUID strings.
5. Output only the JSON object.`;

  const userPrompt = `Target role: ${targetContext.targetRole || "Not provided"}
Target job description or notes: ${targetContext.jobDescription || "Not provided"}
Review tone: ${targetContext.reviewTone || "ATS strict"}

Current resume text:
${targetContext.rewrittenResumeText || resumeText}`;

  const result = await callGemini(systemPrompt, userPrompt);

  if (!result.personalInfo) result.personalInfo = { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "", photoURL: null };
  if (!result.summary) result.summary = "";
  if (!result.experience) result.experience = [];
  if (!result.education) result.education = [];
  if (!result.projects) result.projects = [];
  if (!result.skills) result.skills = { technical: [], soft: [] };
  if (!result.certifications) result.certifications = [];
  if (!result.achievements) result.achievements = [];
  if (!result.languages) result.languages = [];
  if (!result.extracurriculars) result.extracurriculars = [];

  return result;
}
