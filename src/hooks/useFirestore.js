import {
  collection, doc, addDoc, setDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  setCachedResume,
  getCachedResume,
  removeCachedResume,
  upsertCachedResumeInList,
  removeCachedResumeFromList,
  getCachedResumeList,
} from "../services/resumeCache";

export function useFirestore() {

  // ─── Create ────────────────────────────────────────────────────────────────
  async function createResume(userId, data) {
    const docRef = doc(collection(db, "resumes"));
    const serverTime = serverTimestamp();
    const docData = {
      userId,
      createdAt: serverTime,
      updatedAt: serverTime,
      title: "Untitled Resume",
      status: "draft",
      ...data,
    };

    // Fire and forget so we get the ID INSTANTLY and avoid 4s timeout race
    setDoc(docRef, docData).catch(err => console.warn("Failed to sync resume creation:", err));

    // Mirror to localStorage immediately
    const localCopy = {
      id: docRef.id,
      ...docData, // includes userId, status, title from above, plus any data overwrites
      updatedAt: Date.now(),
      createdAt: Date.now(),
      // Remove the FieldValue sentinel so localStorage gets real values if needed
    };
    delete localCopy.createdAt;
    delete localCopy.updatedAt;
    localCopy.createdAt = Date.now();
    localCopy.updatedAt = Date.now();
    
    setCachedResume(docRef.id, localCopy);
    upsertCachedResumeInList(userId, localCopy);

    return docRef.id;
  }

  // ─── Read single ───────────────────────────────────────────────────────────
  async function getResume(resumeId) {
    // 1. Return from localStorage instantly while waiting for Firebase
    const cached = getCachedResume(resumeId);

    try {
      const docRef = doc(db, "resumes", resumeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const fresh = { id: docSnap.id, ...docSnap.data() };
        setCachedResume(resumeId, fresh);   // keep cache fresh
        return fresh;
      }
    } catch (err) {
      console.warn("getResume: Firebase unavailable, using cache", err.message);
      if (cached) return cached;
    }

    return cached ?? null;
  }

  // ─── Read list ─────────────────────────────────────────────────────────────
  async function getUserResumes(userId) {
    // Try Firebase first; fall back to localStorage
    try {
      const q = query(
        collection(db, "resumes"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );
      const snap = await getDocs(q);
      const resumes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return resumes;
    } catch (err) {
      console.warn("getUserResumes: Firebase unavailable, using cache", err.message);
      return getCachedResumeList(userId);
    }
  }

  // ─── Update ────────────────────────────────────────────────────────────────
  async function updateResume(resumeId, data) {
    const docRef = doc(db, "resumes", resumeId);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });

    // Merge into localStorage so a reload shows the latest data
    const existing = getCachedResume(resumeId) ?? {};
    const merged = { ...existing, ...data, id: resumeId, updatedAt: Date.now() };
    setCachedResume(resumeId, merged);
    if (merged.userId) {
      upsertCachedResumeInList(merged.userId, merged);
    }
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  async function deleteResume(resumeId) {
    // Grab userId from cache before we wipe it
    const cached = getCachedResume(resumeId);
    await deleteDoc(doc(db, "resumes", resumeId));
    removeCachedResume(resumeId);
    if (cached?.userId) {
      removeCachedResumeFromList(cached.userId, resumeId);
    }
  }

  // ─── Duplicate ─────────────────────────────────────────────────────────────
  async function duplicateResume(resumeId) {
    const data = await getResume(resumeId);
    if (!data) throw new Error("Resume not found");
    const { id, createdAt, updatedAt, ...rest } = data;
    rest.title = `${rest.title} (Copy)`;
    return await createResume(data.userId, rest);
  }

  return {
    createResume,
    getResume,
    getUserResumes,
    updateResume,
    deleteResume,
    duplicateResume,
  };
}
