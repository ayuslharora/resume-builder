import { getNextGroqKey, markKeyRateLimited, getGroqKeyCount, isRateLimitError } from "./apiKeyManager";
import { sanitizeRewriteOption } from "./rewriteOptionSanitizer";

const GROQ_API_URL = `https://api.groq.com/openai/v1/chat/completions`;
const GROQ_MODEL = "llama-3.1-8b-instant";

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

async function parseLLMResponse(response, provider) {
  const data = await response.json();
  const textContent = data.choices[0].message.content;
  const cleanedText = textContent.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  try {
    return JSON.parse(cleanedText);
  } catch {
    console.error(`Raw ${provider} response:`, textContent);
    throw new Error(`Failed to parse ${provider} JSON output.`);
  }
}

async function makeRequest(systemPrompt, userPrompt, options = {}, apiKey) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      ...options,
    })
  });

  if (!response.ok) {
    const error = new Error(`Groq API Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.headers = response.headers;
    throw error;
  }

  return await parseLLMResponse(response, "Groq");
}

async function callGemini(systemPrompt, userPrompt, options = {}) {
  const maxAttempts = getGroqKeyCount();
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let apiKey;
    try {
      apiKey = getNextGroqKey();
    } catch (rateLimitError) {
      throw rateLimitError;
    }

    try {
      return await makeRequest(systemPrompt, userPrompt, options, apiKey);
    } catch (error) {
      lastError = error;

      if (isRateLimitError(error.status)) {
        const retryAfter = error.headers?.get?.("retry-after") 
          ? parseInt(error.headers.get("retry-after"), 10) 
          : 60;
        markKeyRateLimited(retryAfter);
        continue;
      }

      if (error.status === 401) {
        markKeyRateLimited(60);
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("All API keys exhausted");
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
7. NEVER use em-dashes ("—"). If you must use a dash, use a regular hyphen ("-") or a colon instead.
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

export async function regenerateSection(sectionName, currentSectionData, context, bragSheetText = "") {
  const systemPrompt = `You are an expert resume writer.
Rewrite ONLY the "${sectionName}" section of this resume.
Context about the candidate: ${context.targetRole || 'general role'} applying to ${context.targetCompanyType || 'general'} company.
${bragSheetText ? `\nCandidate's Raw Background/Brag Sheet (Draw facts from here. DO NOT invent details):\n${bragSheetText}\n` : ''}
CRITICAL RULE: NEVER use em-dashes ("—"). Use regular hyphens ("-") or colons instead.
Output ONLY valid JSON in the exact following format:
{
  "${sectionName}": <updated data>
}
CRITICAL: The <updated data> MUST strictly match the data type and exact schema/structure of the original data. For example, if the original data is an array of objects, output an array of objects. If it's an object with "technical" and "soft" arrays, output exactly that structure.
No explanation.`;

  const userPrompt = `Current section data: ${JSON.stringify(currentSectionData)}`;
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
Rewrite one resume bullet for stronger ATS match and recruiter impact.
Use the source document as factual background when it is provided.
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
${targetContext.resumeText || "Not provided"}
${targetContext.sourceDocumentText ? `\n\nRelevant source document context:\n${targetContext.sourceDocumentText}` : ""}`;

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

        return sanitizeRewriteOption({
          version: item.version || item.rewrite || item.text || "",
          focus: item.focus || item.angle || item.theme || "Rewrite",
          whyItWorks: item.whyItWorks || item.reason || item.rationale || "",
        });
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
