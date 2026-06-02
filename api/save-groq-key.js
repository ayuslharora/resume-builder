import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { encrypt } from "./keyEncryption.js";

if (!getApps().length) {
  initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || "resume-cd263" });
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function isValidGroqKeyFormat(key) {
  return typeof key === "string" && /^gsk_[A-Za-z0-9]{20,96}$/.test(key);
}

async function verifyGroqKey(key) {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 1,
      }),
    });
    // 401 = invalid key; 429 = valid but rate-limited; 200 = valid
    return response.status !== 401;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthenticated" });

    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { groqApiKey } = body || {};

    if (!isValidGroqKeyFormat(groqApiKey)) {
      return res.status(400).json({ error: "Invalid Groq API key format. Keys must start with gsk_." });
    }

    const isValid = await verifyGroqKey(groqApiKey);
    if (!isValid) {
      return res.status(400).json({ error: "Groq API key is invalid or inactive." });
    }

    const encrypted = encrypt(groqApiKey);
    const db = getFirestore();

    await Promise.all([
      db.collection("userSecrets").doc(decoded.uid).set({ groqApiKey: encrypted }),
      db.collection("users").doc(decoded.uid).update({ hasPersonalKey: true }),
    ]);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("save-groq-key error:", error.message);
    return res.status(500).json({ error: "Failed to save API key." });
  }
}
