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
  } catch (err) {
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

export async function gradeResume(bragSheetText) {
  const systemPrompt = `You are an expert ATS optimizer and technical recruiter. Review the following resume text.
Provide an objective grade (0-100) and specific feedback.
Return ONLY JSON matching:
{
  "score": number,
  "visualFeedback": ["string"],
  "contentFeedback": ["string"]
}`;
  const userPrompt = `Resume text: ${bragSheetText}`;
  return await callGemini(systemPrompt, userPrompt);
}
