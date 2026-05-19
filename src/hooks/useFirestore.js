import { useCallback } from "react";
import {
  collection, doc, setDoc, writeBatch,
  getCountFromServer, getDoc, getDocs, query, updateDoc, where, serverTimestamp,
  orderBy, limit,
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

function stripPublicShareFields(data = {}) {
  const { isShared: _isShared, shareToken: _shareToken, ...rest } = data ?? {};
  return rest;
}

function buildPublicResumeShareData(resumeId, resumeData) {
  return {
    resumeId,
    ownerId: resumeData.userId ?? null,
    userId: resumeData.userId ?? null,
    shareToken: resumeData.shareToken ?? null,
    isShared: Boolean(resumeData.isShared),
    title: resumeData.title ?? "Untitled Resume",
    status: resumeData.status ?? "draft",
    templateId: resumeData.templateId ?? null,
    resumeData: resumeData.resumeData ?? null,
    bragSheetText: resumeData.bragSheetText ?? "",
    interviewAnswers: resumeData.interviewAnswers ?? null,
    createdAt: resumeData.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

function buildPublicGraderReportShareData(reportId, reportData) {
  return {
    reportId,
    ownerId: reportData.ownerId ?? null,
    shareToken: reportData.shareToken ?? null,
    isShared: true,
    targetRole: reportData.targetRole ?? "",
    fileName: reportData.fileName ?? "",
    reviewTone: reportData.reviewTone ?? "",
    score: reportData.score ?? null,
    report: reportData.report ?? null,
    createdAt: reportData.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

export function useFirestore() {
  const publicResumesCollection = "publicResumes";
  const publicGraderReportsCollection = "publicGraderReports";

  // ─── Create ────────────────────────────────────────────────────────────────
  const createResume = useCallback(async (userId, data) => {
    const docRef = doc(collection(db, "resumes"));
    const serverTime = serverTimestamp();
    const resumeData = stripPublicShareFields(data);
    const docData = {
      title: "Untitled Resume",
      status: "draft",
      ...resumeData,
      userId,
      createdAt: serverTime,
      updatedAt: serverTime,
    };
    const batch = writeBatch(db);
    batch.set(docRef, docData);

    if (docData.isShared && docData.shareToken) {
      batch.set(
        doc(db, publicResumesCollection, docData.shareToken),
        buildPublicResumeShareData(docRef.id, docData)
      );
    }

    await batch.commit();
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
    const docRef = doc(db, publicResumesCollection, shareToken);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return sanitizeResume({ id: data.resumeId || snap.id, ...data });
  }, []);

  const createGraderReport = useCallback(async (data) => {
    const docRef = doc(collection(db, "graderReports"));
    const serverTime = serverTimestamp();
    const reportData = { ...data };
    const docData = {
      ...reportData,
      isShared: true,
      createdAt: serverTime,
      updatedAt: serverTime,
    };
    const batch = writeBatch(db);
    batch.set(docRef, docData);

    if (reportData.shareToken) {
      batch.set(
        doc(db, publicGraderReportsCollection, reportData.shareToken),
        buildPublicGraderReportShareData(docRef.id, docData)
      );
    }

    await batch.commit();
    return docRef.id;
  }, []);

  const saveGraderHistoryEntry = useCallback(async (userId, entry) => {
    if (!userId || !entry?.id) return;
    const docRef = doc(db, "graderHistory", entry.id);
    // JSON round-trip strips undefined values that Firestore rejects
    const sanitized = JSON.parse(JSON.stringify({ ...entry, userId }));
    await setDoc(docRef, sanitized);
  }, []);

  const getUserGraderHistory = useCallback(async (userId) => {
    if (!userId) return [];
    const q = query(
      collection(db, "graderHistory"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(12)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }, []);

  const getGraderReportByShareToken = useCallback(async (shareToken) => {
    const docRef = doc(db, publicGraderReportsCollection, shareToken);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return { id: data.reportId || snap.id, ...data };
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
    const nextResume = { ...existing, ...writeData, updatedAt: serverTimestamp() };
    const batch = writeBatch(db);
    batch.set(docRef, nextResume, { merge: true });

    const previousShareToken = existing?.shareToken;
    const nextShareToken = nextResume.shareToken;
    const wasPublished = Boolean(existing?.isShared && previousShareToken);
    const isPublished = Boolean(nextResume.isShared && nextShareToken);

    if (wasPublished && (!isPublished || previousShareToken !== nextShareToken)) {
      batch.delete(doc(db, publicResumesCollection, previousShareToken));
    }

    if (isPublished) {
      batch.set(
        doc(db, publicResumesCollection, nextShareToken),
        buildPublicResumeShareData(resumeId, nextResume)
      );
    }
    await batch.commit();
  }, [getResume]);

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteResume = useCallback(async (resumeId) => {
    const existing = await getResume(resumeId);
    const batch = writeBatch(db);
    batch.delete(doc(db, "resumes", resumeId));
    if (existing?.shareToken) {
      batch.delete(doc(db, publicResumesCollection, existing.shareToken));
    }
    await batch.commit();
    notifyResumeDeleted(resumeId);
  }, [getResume]);

  // ─── Duplicate ─────────────────────────────────────────────────────────────
  const duplicateResume = useCallback(async (resumeId) => {
    const data = await getResume(resumeId);
    if (!data) throw new Error("Resume not found");
    const rest = { ...data };
    delete rest.id;
    delete rest.createdAt;
    delete rest.updatedAt;
    delete rest.isShared;
    delete rest.shareToken;
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
    saveGraderHistoryEntry,
    getUserGraderHistory,
  };
}
