import { auth } from "./firebase";
import { sanitizeRewriteOption } from "./rewriteOptionSanitizer";

function normalizeBulletRewrites(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const candidates = [
    payload.rewrites,
    payload.suggestions,
    payload.options,
    payload.variants,
    payload.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }

  // Some models return numbered rewrite fields instead of an array.
  const numbered = Object.keys(payload)
    .filter((key) => /^rewrite\d*$/i.test(key))
    .sort((a, b) => a.localeCompare(b))
    .map((key) => payload[key]);

  return numbered.length ? numbered : [];
}

async function callGemini(systemPrompt, userPrompt, options = {}) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User must be logged in to use AI features.");
    
    const token = await user.getIdToken();

    const response = await fetch('/api/groq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ systemPrompt, userPrompt, options })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to communicate with the AI service");
    }

    return result.data;
  } catch (error) {
    console.error("Vercel Function Error:", error);
    throw new Error(error.message || "Failed to communicate with the AI service");
  }
}

export async function generateResume(bragSheetText, interviewAnswers) {
  const isOnePage = interviewAnswers.preferredLength !== "2-pages";
  const hasJD = interviewAnswers.jobDescription && interviewAnswers.jobDescription.trim().length > 0;

  const systemPrompt = `You are an expert resume writer. You write resumes for students and freshers applying to tech roles.

CRITICAL RULES:
1. Extract and use ONLY information from the candidate's Brag Sheet and interview answers. DO NOT invent experience, projects, education, or skills.
2. If a section has no data, leave it as an empty array. Never fabricate.
3. Output ONLY valid JSON matching the schema. No markdown, no explanation.
4. All bullets start with strong action verbs (Led, Built, Developed, Designed, Implemented, Optimized, etc.).
5. Keep every bullet impact-driven and under 20 words.
6. NEVER use em-dashes ("—"). Use a hyphen ("-") or colon instead.

${hasJD ? `KEYWORD SELECTION — CRITICAL:
You have been given a Job Description (JD). You MUST:
- Read the JD carefully and identify the skills, tools, and technologies that are EXPLICITLY mentioned or clearly implied.
- In the "skills" section, include ONLY skills that (a) appear in the JD and (b) are genuinely present in the candidate's background. Do NOT dump every skill from the brag sheet.
- In bullets, weave in JD-relevant keywords naturally where the candidate's experience supports it.
- Omit skills and technologies that are not relevant to this specific role, even if the candidate has them.` : `KEYWORD SELECTION:
Focus on skills and keywords that directly support the target role. Do not include every skill from the brag sheet — be selective and relevant.`}

${isOnePage ? `ONE-PAGE GOAL:
The candidate wants a single-page resume. Be ruthlessly concise — every word must earn its place.
- Keep the summary tight and punchy.
- Only include skills, projects, and experience entries that are directly relevant to this role. Omit anything that does not strengthen the application.
- Prefer fewer, stronger bullets over many weak ones.
- When two items are roughly equivalent in relevance, drop the weaker one.` : `TWO-PAGE GOAL:
The candidate is comfortable with two pages. Be thorough but still concise and focused on the target role.`}`;

  const userPrompt = `Here is the candidate's raw achievements document (Brag Sheet):
---
${bragSheetText ? bragSheetText : "(No document provided. Base the resume strictly on the interview answers below.)"}
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
${hasJD ? `\nJob Description to tailor this resume for:\n---\n${interviewAnswers.jobDescription}\n---` : ""}

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

  const result = await callGemini(systemPrompt, userPrompt, {
    // Keep ATS rescans stable so repeated scans on unchanged content
    // produce near-identical scoring and recommendations.
    temperature: 0,
    top_p: 1,
  });

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

export async function regenerateSection(sectionName, currentSectionData, context, bragSheetText = "", customInstruction = "") {
  const systemPrompt = `You are an expert resume writer.
Rewrite the "${sectionName}" section of this resume.

CRITICAL INSTRUCTIONS:
1. SEMANTIC CONTINUITY: You MUST preserve the core facts and value of the original content.
2. If the user provides a "USER INSTRUCTION", you MUST prioritize it (e.g., "add more detail", "focus on leadership", "add more bullets").
3. When asked to "add more bullets" or "provide more info", use the provided Brag Sheet (if any) to find REAL additional facts. DO NOT invent fake experiences.
4. Output ONLY valid JSON in the exact following format:
{
  "${sectionName}": <updated data>
}
5. The <updated data> MUST strictly match the exact schema and structure of the original data.
6. NEVER use em-dashes ("—"). Use regular hyphens ("-") or colons.
No explanation.`;

  const userPrompt = `Current section data: ${JSON.stringify(currentSectionData)}

${bragSheetText ? `Candidate's Raw Background (Brag Sheet):
${bragSheetText}` : ""}

Context: ${context.targetRole || 'general role'} at ${context.targetCompanyType || 'general'} company.

${customInstruction ? `USER INSTRUCTION (PRIORITY):
${customInstruction}` : "Improve this section for better impact and clarity while maintaining all facts."}`;

  let result = await callGemini(systemPrompt, userPrompt);

  if (result && result[sectionName] !== undefined) {
    result = result[sectionName];
  } else if (result && typeof result === 'object' && !Array.isArray(result)) {
    const keys = Object.keys(result);
    if (keys.length === 1) {
      result = result[keys[0]];
    }
  }

  // Safety fallback for skills section schema corruption
  if (sectionName === "skills") {
    // Unwrap nested 'skills' object if AI double-wrapped it
    if (result.skills && !result.technical && !result.soft) {
      result = result.skills;
    }

    // If AI returned a flat array instead of categorized object
    if (Array.isArray(result)) {
      result = { technical: result, soft: currentSectionData?.soft || [] };
    }

    // Normalize strings to arrays if AI returned comma-separated strings
    if (typeof result.technical === 'string') result.technical = result.technical.split(',').map(s => s.trim());
    if (typeof result.soft === 'string') result.soft = result.soft.split(',').map(s => s.trim());

    // Ensure final output has arrays; if not, fallback to original data to prevent deletion
    result = {
      technical: Array.isArray(result.technical) && result.technical.length > 0 ? result.technical : currentSectionData?.technical || [],
      soft: Array.isArray(result.soft) && result.soft.length > 0 ? result.soft : currentSectionData?.soft || []
    };
  }

  return result;
}

export async function regenerateItem(sectionName, currentItemData, context, bragSheetText = "") {
  const systemPrompt = `You are an expert resume writer.
Rewrite ONLY this single item from the "${sectionName}" section of the candidate's resume.
Context about the candidate: ${context.targetRole || 'general role'} applying to ${context.targetCompanyType || 'general'} company.
${bragSheetText ? `\nCandidate's Raw Background/Brag Sheet (Draw facts from here. DO NOT invent details):\n${bragSheetText}\n` : ''}
CRITICAL RULE: NEVER use em-dashes ("—"). Use regular hyphens ("-") or colons instead.
Do NOT invent new experiences, but improve the wording, impact, and formatting of the existing details. Keep bullets concise and start with strong action verbs.
Output ONLY valid JSON representing the updated item. Maintain the same schema as the input object, specifically keeping the "id" unchanged.
No explanation.`;

  const userPrompt = `Current item data: ${JSON.stringify(currentItemData)}`;
  const result = await callGemini(systemPrompt, userPrompt);

  // Ensure the id remains unchanged to prevent React key issues
  if (result && typeof result === 'object' && currentItemData.id) {
    result.id = currentItemData.id;
  }

  return result;
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
Your task is to rewrite one resume bullet point.

CRITICAL INSTRUCTIONS:
1. SEMANTIC CONTINUITY: You MUST preserve the core meaning, factual content, and value of the "Original Bullet".
2. DO NOT drift into unrelated topics. The rewritten bullet must represent the SAME experience or achievement as the original, but with better wording or a specific focus.
3. If the user provides a "USER INSTRUCTION", apply that specific change (e.g., "make it sound more leadership-focused") WITHOUT losing the underlying facts of the original bullet.
4. DO NOT invent new metrics, tools, or responsibilities that were not in the original text or context.
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
2. Each 'version' must be a single, complete bullet line.
3. CONCISENESS: Keep rewrites sharp and short. Avoid filler words and aim for high impact in few words.
4. NEVER swap the 'version' and 'focus' fields.
5. Use strong action verbs.`;

  const userPrompt = `Target role: ${targetContext.targetRole || "Not provided"}
Target job description or notes: ${targetContext.jobDescription || "Not provided"}

Original bullet:
${originalBullet}

Relevant resume context:
${targetContext.resumeText || "Not provided"}
${targetContext.sourceDocumentText ? `\nRelevant source document context:\n${targetContext.sourceDocumentText}` : ""}

${targetContext.customInstruction ? `USER INSTRUCTION (PRIORITY):
${targetContext.customInstruction}` : "Improve this bullet for maximum impact and ATS compatibility."}`;

  const result = await callGemini(systemPrompt, userPrompt);
  const rawRewrites = normalizeBulletRewrites(result);

  return {
    rewrites: rawRewrites
      .map((item) => {
        if (typeof item === "string") {
          return sanitizeRewriteOption({
            version: item,
            focus: "Rewrite",
            whyItWorks: "",
          });
        }

        if (!item || typeof item !== "object") return null;

        // More robust mapping to handle AI variations in keys
        const version = item.version || item.content || item.bullet || item.rewrite || item.text || "";
        const focus = item.focus || item.label || item.title || item.angle || item.theme || "Rewrite";
        const whyItWorks = item.whyItWorks || item.reason || item.rationale || item.explanation || "";

        return sanitizeRewriteOption({ version, focus, whyItWorks });
      })
      .filter((item) => item && item.version),
  };
}

export async function improveResume(resumeText, targetContext = {}) {
  const systemPrompt = `You are an expert resume writer improving an existing resume for a specific target role.
You must keep the candidate truthful and only use evidence from the supplied resume text, source document, and job notes.
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
${targetContext.rewrittenResumeText || resumeText}
${targetContext.sourceDocumentText ? `\n\nCandidate's raw background/source document (use this to recover concrete facts and stronger details, but do not invent anything beyond it):\n${targetContext.sourceDocumentText}` : ""}`;

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

export async function generateCoverLetter(resumeData, jobDescription) {
  const systemPrompt = `You are an expert career coach and executive resume writer.
Your task is to write a highly professional, compelling, and tailored cover letter for the candidate.
You will be provided with the candidate's resume data (in JSON format) and the target Job Description.

CRITICAL RULES:
1. Write in a confident, professional, and natural tone. Do not use overly flowery language or cliché openings like "I am writing to express my interest in..."
2. Start with a strong hook that highlights a key relevant achievement.
3. Draw DIRECT connections between the candidate's actual experience/skills from their resume and the core requirements in the job description.
4. DO NOT invent or hallucinate any experience, metrics, or skills that are not present in the resume data.
5. Format the output with clear paragraphs. Use standard cover letter conventions.
6. The letter should be exactly 3 to 4 paragraphs long.
7. Return ONLY a valid JSON object matching this schema exactly:
{
  "coverLetter": "The full text of the cover letter with paragraphs separated by double newlines (\\n\\n)"
}
Output only the JSON. Do not include markdown formatting or explanations.`;

  const userPrompt = `Candidate's Resume Data:
${JSON.stringify(resumeData, null, 2)}

Target Job Description:
${jobDescription || "Not provided (Write a strong general cover letter based on their most recent role)."}`;

  const result = await callGemini(systemPrompt, userPrompt);
  return result;
}
