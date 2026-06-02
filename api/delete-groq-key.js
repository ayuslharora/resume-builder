import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || "resume-cd263" });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthenticated" });

    const token = authHeader.split("Bearer ")[1];
    await getAuth().verifyIdToken(token);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("delete-groq-key error:", error.message);
    return res.status(500).json({ error: "Failed to delete API key." });
  }
}
