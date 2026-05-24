/**
 * One-time migration script: clears all existing resumeViews documents.
 * Run once with: node scripts/clearResumeViews.mjs
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_PROJECT_ID + service account.
 * Uses firebase-admin which is already in package.json.
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";

// Load project ID from .env manually (no dotenv dependency needed)
const envRaw = readFileSync(".env", "utf8");
const projectId = envRaw.match(/VITE_FIREBASE_PROJECT_ID=(.+)/)?.[1]?.trim();

if (!projectId) {
  console.error("Could not read VITE_FIREBASE_PROJECT_ID from .env");
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ projectId });
}

const db = getFirestore();

async function deleteAllResumeViews() {
  const col = db.collection("resumeViews");
  let deleted = 0;
  let batch;

  // Paginate in batches of 500
  while (true) {
    const snap = await col.limit(500).get();
    if (snap.empty) break;

    batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.docs.length;
    console.log(`Deleted ${deleted} documents so far...`);
  }

  console.log(`\n✅ Done. Deleted ${deleted} resumeViews documents total.`);
}

deleteAllResumeViews().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
