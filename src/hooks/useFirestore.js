import { useCallback } from "react";
import {
  collection, doc, setDoc, deleteDoc,
  getCountFromServer, getDoc, getDocs, query, updateDoc, where, serverTimestamp
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  buildResumeWriteData,
  getUserResumeQueryConstraints,
} from "../services/resumePersistence";
import { notifyResumeDeleted } from "../services/resumeListSync";

function sanitizeResume(resume) {
  if (resume?.resumeData?.summary && typeof resume.resumeData.summary === 'object') {
    resume.resumeData.summary = resume.resumeData.summary.summary || "";
  }
  return resume;
}

export function useFirestore() {

  // ─── Create ────────────────────────────────────────────────────────────────
  const createResume = useCallback(async (userId, data) => {
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
    await setDoc(docRef, docData);

    return docRef.id;
  }, []);

  // ─── Read single ───────────────────────────────────────────────────────────
  const getResume = useCallback(async (resumeId) => {
    const docRef = doc(db, "resumes", resumeId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return sanitizeResume({ id: docSnap.id, ...docSnap.data() });
  }, []);

  // ─── Read list ─────────────────────────────────────────────────────────────
  const getUserResumes = useCallback(async (userId) => {
    const q = query(
      collection(db, "resumes"),
      ...getUserResumeQueryConstraints(where, userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => sanitizeResume({ id: d.id, ...d.data() }));
  }, []);

  const getResumeByShareToken = useCallback(async (shareToken) => {
    const q = query(
      collection(db, "resumes"),
      where("shareToken", "==", shareToken),
      where("isShared", "==", true)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return sanitizeResume({ id: first.id, ...first.data() });
  }, []);

  const createGraderReport = useCallback(async (data) => {
    const docRef = doc(collection(db, "graderReports"));
    const serverTime = serverTimestamp();
    await setDoc(docRef, {
      ...data,
      createdAt: serverTime,
      updatedAt: serverTime,
      isShared: true,
    });

    return docRef.id;
  }, []);

  const getGraderReportByShareToken = useCallback(async (shareToken) => {
    const q = query(
      collection(db, "graderReports"),
      where("shareToken", "==", shareToken),
      where("isShared", "==", true)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const first = snap.docs[0];
    return { id: first.id, ...first.data() };
  }, []);

  const recordResumeView = useCallback(async ({ resumeId, ownerId, viewerId }) => {
    if (!resumeId || !ownerId || !viewerId) return;

    const viewRef = doc(db, "resumeViews", `${resumeId}_${viewerId}`);
    try {
      await updateDoc(viewRef, {
        lastViewedAt: serverTimestamp(),
      });
    } catch {
      await setDoc(viewRef, {
        resumeId,
        ownerId,
        viewerId,
        createdAt: serverTimestamp(),
        lastViewedAt: serverTimestamp(),
      });
    }
  }, []);

  const getResumeViewCounts = useCallback(async (resumeIds = [], ownerId = "") => {
    if (!ownerId) return {};

    const uniqueIds = Array.from(new Set(resumeIds.filter(Boolean)));
    const entries = await Promise.all(uniqueIds.map(async (resumeId) => {
      const q = query(
        collection(db, "resumeViews"),
        where("resumeId", "==", resumeId),
        where("ownerId", "==", ownerId)
      );
      const snapshot = await getCountFromServer(q);
      return [resumeId, snapshot.data().count || 0];
    }));

    return Object.fromEntries(entries);
  }, []);

  // ─── Update ────────────────────────────────────────────────────────────────
  const updateResume = useCallback(async (resumeId, data) => {
    const docRef = doc(db, "resumes", resumeId);
    const existing = await getResume(resumeId);
    const writeData = buildResumeWriteData(existing, data);
    await setDoc(docRef, { ...writeData, updatedAt: serverTimestamp() }, { merge: true });
  }, [getResume]);

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteResume = useCallback(async (resumeId) => {
    await deleteDoc(doc(db, "resumes", resumeId));
    notifyResumeDeleted(resumeId);
  }, []);

  // ─── Duplicate ─────────────────────────────────────────────────────────────
  const duplicateResume = useCallback(async (resumeId) => {
    const data = await getResume(resumeId);
    if (!data) throw new Error("Resume not found");
    const rest = { ...data };
    delete rest.id;
    delete rest.createdAt;
    delete rest.updatedAt;
    rest.title = `${rest.title} (Copy)`;
    return await createResume(data.userId, rest);
  }, [getResume, createResume]);

  return {
    createResume,
    createGraderReport,
    getResume,
    getGraderReportByShareToken,
    getResumeViewCounts,
    getResumeByShareToken,
    getUserResumes,
    updateResume,
    deleteResume,
    duplicateResume,
    recordResumeView,
  };
}
