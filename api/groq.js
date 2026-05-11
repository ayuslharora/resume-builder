import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!getApps().length) {
  initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || "resume-cd263" });
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

let keyStates = [];
let currentIndex = 0;
let lastUsedIndex = 0;

function getKeys() {
  // Grab keys from Vercel's environment variables (same ones you had in .env)
  const keysString = process.env.GROQ_API_KEYS || process.env.VITE_GROQ_API_KEY || "";
  return keysString.split(",").map(k => k.trim()).filter(Boolean);
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
    await getAuth().verifyIdToken(token);
    
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { systemPrompt, userPrompt, options } = body || {};
    
    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: 'Missing prompts' });
    }

    const result = await makeGroqRequest(systemPrompt, userPrompt, options);
    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("API Error:", error);
    if (error.message === "rate-limited") {
      return res.status(429).json({ error: "All keys rate-limited. Try again soon." });
    }
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
