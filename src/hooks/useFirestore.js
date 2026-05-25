import { useCallback } from "react";
import {
  collection, doc, setDoc, writeBatch,
  getCountFromServer, getDoc, getDocs, query, updateDoc, where, orderBy, serverTimestamp,
  increment, limit,
} from "firebase/firestore";
import { db } from "../services/firebase";
import {
  buildResumeWriteData,
  getUserResumeQueryConstraints,
} from "../services/resumePersistence";
import { notifyResumeDeleted } from "../services/resumeListSync";
import { normalizeTimestamp } from "../utils/viewStats";

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

  const recordResumeView = useCallback(async ({ resumeId, ownerId, viewerId, country, countryCode, city, region, referrer, device, os }) => {
    if (!resumeId || !ownerId || !viewerId) return;

    const viewRef = doc(db, "resumeViews", `${resumeId}_${viewerId}`);
    const enriched = {
      country: country ?? "Unknown",
      countryCode: countryCode ?? "",
      city: city ?? "Unknown",
      region: region ?? "Unknown",
      referrer: referrer ?? "Direct",
      device: device ?? "Desktop",
      os: os ?? "Unknown",
    };
    try {
      await updateDoc(viewRef, {
        lastViewedAt: serverTimestamp(),
        ...enriched,
      });
    } catch {
      await setDoc(viewRef, {
        resumeId,
        ownerId,
        viewerId,
        createdAt: serverTimestamp(),
        lastViewedAt: serverTimestamp(),
        ...enriched,
      });
    }
  }, []);

  const updateResumeViewDuration = useCallback(async (viewDocId, durationSeconds) => {
    if (!viewDocId || durationSeconds < 3) return;
    const viewRef = doc(db, "resumeViews", viewDocId);
    try {
      await updateDoc(viewRef, { duration: durationSeconds });
    } catch {}
  }, []);

  const recordLinkClick = useCallback(async ({ resumeId, ownerId, label, url }) => {
    if (!resumeId || !ownerId || !label) return;
    const docId = `${resumeId}_${label.toLowerCase().replace(/\s+/g, "_")}`;
    const ref = doc(db, "resumeLinkClicks", docId);
    try {
      await updateDoc(ref, { count: increment(1), lastClickedAt: serverTimestamp(), url });
    } catch {
      await setDoc(ref, { resumeId, ownerId, label, url, count: 1, lastClickedAt: serverTimestamp() });
    }
  }, []);

  const getResumeLinkClicks = useCallback(async (resumeId, ownerId) => {
    if (!resumeId || !ownerId) return [];
    const q = query(
      collection(db, "resumeLinkClicks"),
      where("resumeId", "==", resumeId),
      where("ownerId", "==", ownerId)
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.count - a.count);
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

  /**
   * Fetch the full list of view docs for a single resume (for the per-resume stats panel/page).
   * Returns up to 200 most-recent view records sorted newest-first.
   */
  const getResumeViewDetails = useCallback(async (resumeId, ownerId) => {
    if (!resumeId || !ownerId) return [];
    const q = query(
      collection(db, "resumeViews"),
      where("resumeId", "==", resumeId),
      where("ownerId", "==", ownerId),
      limit(500)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => normalizeTimestamp(b.createdAt) - normalizeTimestamp(a.createdAt));
  }, []);

  const getOwnerViewDetails = useCallback(async (ownerId) => {
    if (!ownerId) return [];
    const q = query(
      collection(db, "resumeViews"),
      where("ownerId", "==", ownerId),
      limit(1000)
    );
    const snap = await getDocs(q);
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return docs.sort((a, b) => normalizeTimestamp(b.createdAt) - normalizeTimestamp(a.createdAt));
  }, []);

  const getOwnerViewCount = useCallback(async (ownerId) => {
    if (!ownerId) return 0;
    const q = query(
      collection(db, "resumeViews"),
      where("ownerId", "==", ownerId)
    );
    const snap = await getCountFromServer(q);
    return snap.data().count;
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
    if (existing?.isShared && existing?.shareToken) {
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
    getResumeViewDetails,
    getOwnerViewDetails,
    getOwnerViewCount,
    getResumeByShareToken,
    getUserResumes,
    updateResume,
    deleteResume,
    duplicateResume,
    recordResumeView,
    updateResumeViewDuration,
    recordLinkClick,
    getResumeLinkClicks,
    saveGraderHistoryEntry,
    getUserGraderHistory,
  };
}
