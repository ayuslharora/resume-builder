import { auth } from "./firebase";
import { sanitizeRewriteOption } from "./rewriteOptionSanitizer";

function coerceToString(val) {
  if (typeof val === "string") return val;
  if (!val || typeof val !== "object") return "";
  return val.text || val.content || val.summary || val.description || val.value || "";
}

function normalizeStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(coerceToString).filter(Boolean);
}

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

async function callLlmTask(task, payload = {}) {
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
      body: JSON.stringify({ task, payload })
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
  const result = await callLlmTask("generateResume", { bragSheetText, interviewAnswers });

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
  let result = await callLlmTask("regenerateSection", {
    sectionName,
    currentSectionData,
    targetContext: context,
    bragSheetText,
    customInstruction,
  });

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

export async function regenerateItem(sectionName, currentItemData, context, bragSheetText = "", customInstruction = "") {
  const result = await callLlmTask("regenerateItem", {
    sectionName,
    currentItemData,
    targetContext: context,
    bragSheetText,
    customInstruction,
  });

  if (result && typeof result === 'object') {
    if (currentItemData.id) result.id = currentItemData.id;
    if (Array.isArray(result.bullets)) {
      result.bullets = result.bullets.map(coerceToString).filter(Boolean);
    }
    if (Array.isArray(result.achievements)) {
      result.achievements = result.achievements.map(coerceToString).filter(Boolean);
    }
  }

  return result;
}

export async function extractBasicInfo(bragSheetText) {
  return await callLlmTask("extractBasicInfo", { bragSheetText });
}

export async function gradeResume(resumeText, targetContext = {}) {
  const result = await callLlmTask("gradeResume", { resumeText, targetContext });

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
    strengths: normalizeStringArray(result.strengths),
    priorityFixes: Array.isArray(result.priorityFixes) ? result.priorityFixes : [],
    keywordGaps: normalizeStringArray(result.keywordGaps),
    keywordPlacementSuggestions: Array.isArray(result.keywordPlacementSuggestions) ? result.keywordPlacementSuggestions : [],
    weakBullets: Array.isArray(result.weakBullets) ? result.weakBullets : [],
    sectionFeedback: Array.isArray(result.sectionFeedback)
      ? result.sectionFeedback.map((s) => ({ ...s, changes: normalizeStringArray(s.changes) }))
      : [],
    rewriteSuggestions: Array.isArray(result.rewriteSuggestions) ? result.rewriteSuggestions : [],
    atsRisks: Array.isArray(result.atsRisks) ? result.atsRisks : [],
    jobMatch: {
      matchedRequirements: normalizeStringArray(result?.jobMatch?.matchedRequirements),
      partialMatches: normalizeStringArray(result?.jobMatch?.partialMatches),
      missingEvidence: normalizeStringArray(result?.jobMatch?.missingEvidence),
    },
    tonePerspective: result.tonePerspective || "",
  };
}

export async function rewriteResumeBullet(originalBullet, targetContext = {}) {
  const result = await callLlmTask("rewriteResumeBullet", { originalBullet, targetContext });
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
  const result = await callLlmTask("improveResume", { resumeText, targetContext });

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
  const result = await callLlmTask("generateCoverLetter", { resumeData, jobDescription });
  return result;
}
