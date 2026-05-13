import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { buildLlmTaskRequest, LlmTaskError } from './groqTasks.js';

if (!getApps().length) {
  initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || "resume-cd263" });
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

let keyStates = [];
let currentIndex = 0;
let lastUsedIndex = 0;
const rateLimitBuckets = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const TASK_RATE_LIMITS = {
  generateResume: 8,
  improveResume: 8,
  generateCoverLetter: 8,
  gradeResume: 15,
  regenerateSection: 18,
  regenerateItem: 18,
  rewriteResumeBullet: 30,
  extractBasicInfo: 20,
};

function getKeys() {
  const keysString = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  return keysString.split(",").map(k => k.trim()).filter(Boolean);
}

function enforceRateLimit(uid, task) {
  if (!uid) {
    throw new LlmTaskError("Unauthenticated", 401);
  }

  const now = Date.now();
  const bucketKey = `${uid}:${task}`;
  const limit = TASK_RATE_LIMITS[task] || 12;
  const bucket = rateLimitBuckets.get(bucketKey);

  if (!bucket || now >= bucket.resetAt) {
    rateLimitBuckets.set(bucketKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }

  if (bucket.count >= limit) {
    throw new LlmTaskError("Too many AI requests. Try again soon.", 429);
  }

  bucket.count += 1;
}

function initializeKeyStates() {
  const keys = getKeys();
  if (keyStates.length !== keys.length) {
    keyStates = keys.map(() => ({
      available: true,
      cooldownUntil: null,
      invalid: false,
    }));
  }
}

function getNextGroqKey() {
  const keys = getKeys();
  if (keys.length === 0) {
    throw new Error("No Groq API keys configured on server");
  }

  initializeKeyStates();
  const now = Date.now();

  for (let i = 0; i < keys.length; i++) {
    const index = (currentIndex + i) % keys.length;
    const state = keyStates[index];

    if (state.invalid) continue;

    if (state.available || (state.cooldownUntil && now >= state.cooldownUntil)) {
      state.available = true;
      state.cooldownUntil = null;
      lastUsedIndex = index;
      currentIndex = (index + 1) % keys.length;
      return keys[index];
    }
  }

  throw new Error("rate-limited");
}

function markKeyRateLimited(retryAfterSeconds = 60) {
  if (keyStates[lastUsedIndex]) {
    keyStates[lastUsedIndex] = {
      available: false,
      cooldownUntil: Date.now() + (retryAfterSeconds * 1000),
      invalid: false,
    };
  }
}

async function makeGroqRequest(systemPrompt, userPrompt, options = {}) {
  const apiKey = getNextGroqKey();
  
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
    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") 
        ? parseInt(response.headers.get("retry-after"), 10) 
        : 60;
      markKeyRateLimited(retryAfter);
      return await makeGroqRequest(systemPrompt, userPrompt, options);
    }
    throw new Error(`Groq API Error: ${response.status}`);
  }

  const data = await response.json();
  const textContent = data.choices[0].message.content;
  const cleanedText = textContent.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  return JSON.parse(cleanedText);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decoded = await getAuth().verifyIdToken(token);
    
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { task, payload } = body || {};
    const taskRequest = buildLlmTaskRequest(task, payload);
    enforceRateLimit(decoded.uid, task);

    const result = await makeGroqRequest(
      taskRequest.systemPrompt,
      taskRequest.userPrompt,
      taskRequest.options
    );
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("API Error:", error);
    if (error instanceof LlmTaskError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error.message === "rate-limited") {
      return res.status(429).json({ error: "All keys rate-limited. Try again soon." });
    }
    if (error.message === "No Groq API keys configured on server") {
      return res.status(500).json({ error: "AI service is not configured." });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
