import { createContext, useContext, useReducer, useCallback, useRef, useState } from "react";
import { useFirestore } from "../hooks/useFirestore";
import { useAuth } from "./AuthContext";
import {
  getCachedResume,
  setCachedResume,
  upsertCachedResumeInList,
} from "../services/resumeCache";
import { getResumeBuilderStep } from "../services/resumePersistence";

const ResumeContext = createContext();

const initialBuilderState = {
  bragSheetText: "",
  bragSheetFileName: "",
  photoFile: null,
  photoURL: null,
  interviewAnswers: {
    targetRole: "",
    targetCompanyType: "",
    experienceLevel: "",
    skillsToHighlight: "",
    careerObjective: "",
    technologiesToEmphasize: "",
    preferredLength: "1-page",
    additionalContext: ""
  },
  templateId: null,
  resumeData: null,
  isGenerating: false,
  generationError: null,
  isSaving: false
};

function builderReducer(state, action) {
  switch (action.type) {
    case "SET_BRAG_SHEET":
      return { ...state, bragSheetText: action.payload.text, bragSheetFileName: action.payload.fileName };
    case "SET_PHOTO":
      return { ...state, photoFile: action.payload.file, photoURL: action.payload.url };
    case "SET_INTERVIEW_ANSWERS":
      return { ...state, interviewAnswers: { ...state.interviewAnswers, ...action.payload } };
    case "SET_TEMPLATE_ID":
      return { ...state, templateId: action.payload };
    case "SET_RESUME_DATA":
      return { ...state, resumeData: action.payload };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload.isGenerating, generationError: action.payload.error };
    case "UPDATE_SECTION":
      return {
        ...state,
        resumeData: {
          ...state.resumeData,
          [action.payload.sectionName]: action.payload.sectionData
        }
      };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "LOAD_STATE":
      return { ...initialBuilderState, ...action.payload };
    case "RESET":
      return initialBuilderState;
    default:
      return state;
  }
}

export function ResumeProvider({ children }) {
  const [builderData, dispatch] = useReducer(builderReducer, initialBuilderState);
  const [currentStep, setCurrentStep] = useState(1);
  const [activeResumeId, setActiveResumeId] = useState(null);
  const { currentUser } = useAuth();

  const { updateResume, getResume, createResume } = useFirestore();
  const activeResumeIdRef = useRef(null); // Ref to always have latest ID in async callbacks

  // ─── LOAD / INIT ──────────────────────────────────────────────────────────
  const loadResumeData = async (resumeId) => {
    if (resumeId === "new") {
      dispatch({ type: "RESET" });
      setCurrentStep(1);
      setActiveResumeId("new");
      activeResumeIdRef.current = "new";
      return;
    }

    setActiveResumeId(resumeId);
    activeResumeIdRef.current = resumeId;

    // ── 1. Instant load from localStorage so the builder doesn't blank ──────
    const cached = getCachedResume(resumeId);
    if (cached) {
      dispatch({
        type: "LOAD_STATE",
        payload: {
          bragSheetText:    cached.bragSheetText    ?? "",
          photoURL:         cached.photoURL         ?? null,
          interviewAnswers: cached.interviewAnswers ?? initialBuilderState.interviewAnswers,
          templateId:       cached.templateId       ?? null,
          resumeData:       cached.resumeData       ?? null,
        }
      });
      setCurrentStep(getResumeBuilderStep(cached));
    }

    // ── 2. Fetch fresh data from Firebase and update if different ────────────
    try {
      const data = await getResume(resumeId);   // getResume already updates cache
      if (data) {
        dispatch({
          type: "LOAD_STATE",
          payload: {
            bragSheetText:    data.bragSheetText    ?? "",
            photoURL:         data.photoURL         ?? null,
            interviewAnswers: data.interviewAnswers ?? initialBuilderState.interviewAnswers,
            templateId:       data.templateId       ?? null,
            resumeData:       data.resumeData       ?? null,
          }
        });
        setCurrentStep(getResumeBuilderStep(data));
      }
    } catch (err) {
      console.warn("loadResumeData: Firebase unavailable, using cache →", err.message);
      // Already loaded from cache above — nothing more to do
    }
  };

  // ─── SAVE ──────────────────────────────────────────────────────────────────
  const debounceRef = useRef(null);

  /**
   * Write data to localStorage immediately (synchronous), then persist to
   * Firestore. This ensures a page reload always shows the latest state.
   */
  const persistLocally = useCallback((resumeId, dataToMerge) => {
    if (!resumeId || resumeId === "new" || resumeId === "creating") return;
    const existing = getCachedResume(resumeId) ?? {};
    const merged = { ...existing, ...dataToMerge, id: resumeId, updatedAt: Date.now() };
    setCachedResume(resumeId, merged);
    if (currentUser && merged.userId) {
      upsertCachedResumeInList(merged.userId, merged);
    }
  }, [currentUser]);

  // Direct (non-debounced) save — used for critical saves at step transitions.
  // Races against a 4s timeout so Firestore offline can't block navigation.
  const saveNow = useCallback(async (dataToMerge) => {
    // Cancel any pending debounced save to avoid a race
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    let id = activeResumeIdRef.current;
    if (!id || id === "creating" || !currentUser) return null;

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("saveNow timed out")), 4000)
    );

    try {
      dispatch({ type: "SET_SAVING", payload: true });

      if (id === "new") {
        activeResumeIdRef.current = "creating";
        const newId = await Promise.race([
          createResume(currentUser.uid, {
            title: dataToMerge.title || "New Resume",
            status: dataToMerge.status || "draft",
            userId: currentUser.uid,
            ...dataToMerge,
          }),
          timeout,
        ]);
        setActiveResumeId(newId);
        activeResumeIdRef.current = newId;
        window.history.replaceState(null, "", `/builder/${newId}`);
        // createResume already wrote to localStorage via useFirestore
        return newId;
      } else {
        // Write to localStorage first (instant), then Firestore
        persistLocally(id, { ...dataToMerge, userId: currentUser.uid });
        await Promise.race([updateResume(id, { ...dataToMerge, userId: currentUser.uid }), timeout]);
        return id;
      }
    } catch (err) {
      if (activeResumeIdRef.current === "creating") {
        activeResumeIdRef.current = "new";
      }
      console.warn("Save skipped (Firestore offline or timeout):", err.message);
      return null;
    } finally {
      dispatch({ type: "SET_SAVING", payload: false });
    }
  }, [currentUser, updateResume, createResume, persistLocally]);

  // Debounced save — used for live typing in EditStep
  const saveToFirestore = useCallback((dataToMerge) => {
    if (!currentUser) return;

    // Write to localStorage immediately so a reload shows the latest text
    const id = activeResumeIdRef.current;
    persistLocally(id, { ...dataToMerge, userId: currentUser.uid });

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const latestId = activeResumeIdRef.current;
      if (!latestId || latestId === "creating" || latestId === "new") return;
      try {
        await updateResume(latestId, { ...dataToMerge, userId: currentUser.uid });
      } catch (err) {
        console.warn("Live save failed:", err.message);
      }
    }, 1000);
  }, [currentUser, updateResume, persistLocally]);

  // ─── STEP NAVIGATION ───────────────────────────────────────────────────────
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  }, []);

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step) => setCurrentStep(step);

  // ─── DISPATCH HELPERS ──────────────────────────────────────────────────────
  const setBragSheet     = (text, fileName) => dispatch({ type: "SET_BRAG_SHEET",       payload: { text, fileName } });
  const setPhoto         = (file, url)      => dispatch({ type: "SET_PHOTO",            payload: { file, url } });
  const setInterviewAnswers = (answers)     => dispatch({ type: "SET_INTERVIEW_ANSWERS", payload: answers });
  const setTemplateId    = (id)             => dispatch({ type: "SET_TEMPLATE_ID",       payload: id });
  const setResumeData    = (data)           => dispatch({ type: "SET_RESUME_DATA",       payload: data });
  const updateSection    = (sectionName, sectionData) =>
    dispatch({ type: "UPDATE_SECTION", payload: { sectionName, sectionData } });
  const resetBuilder = () => { dispatch({ type: "RESET" }); setCurrentStep(1); };

  const value = {
    builderData, dispatch,
    setBragSheet, setPhoto, setInterviewAnswers, setTemplateId, setResumeData, updateSection,
    currentStep, goToStep, nextStep, prevStep,
    activeResumeId, saveToFirestore, saveNow, loadResume: loadResumeData, resetBuilder,
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  return useContext(ResumeContext);
}
