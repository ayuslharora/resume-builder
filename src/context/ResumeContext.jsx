import { useReducer, useCallback, useRef, useState } from "react";
import { useFirestore } from "../hooks/useFirestore";
import { useAuth } from "./useAuth";
import { getResumeBuilderStep } from "../services/resumePersistence";
import { ResumeContext } from "./resume-context";

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
    additionalContext: "",
    jobDescription: ""
  },
  templateId: null,
  resumeData: null,
  bulletsRewritten: 0,
  pastResumeData: [],
  futureResumeData: [],
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
      return { 
        ...state, 
        pastResumeData: state.resumeData ? [...state.pastResumeData, state.resumeData] : state.pastResumeData,
        futureResumeData: [],
        resumeData: action.payload 
      };
    case "SET_GENERATING":
      return { ...state, isGenerating: action.payload.isGenerating, generationError: action.payload.error };
    case "UPDATE_SECTION":
      return {
        ...state,
        pastResumeData: state.resumeData ? [...state.pastResumeData, state.resumeData] : state.pastResumeData,
        futureResumeData: [],
        resumeData: {
          ...state.resumeData,
          [action.payload.sectionName]: action.payload.sectionData
        }
      };
    case "UNDO_RESUME": {
      if (state.pastResumeData.length === 0) return state;
      const previous = state.pastResumeData[state.pastResumeData.length - 1];
      return {
        ...state,
        pastResumeData: state.pastResumeData.slice(0, -1),
        futureResumeData: [state.resumeData, ...state.futureResumeData],
        resumeData: previous
      };
    }
    case "REDO_RESUME": {
      if (state.futureResumeData.length === 0) return state;
      const next = state.futureResumeData[0];
      return {
        ...state,
        pastResumeData: [...state.pastResumeData, state.resumeData],
        futureResumeData: state.futureResumeData.slice(1),
        resumeData: next
      };
    }
    case "INCREMENT_BULLETS_REWRITTEN":
      return { ...state, bulletsRewritten: (state.bulletsRewritten || 0) + (action.payload ?? 1) };
    case "SET_SAVING":
      return { ...state, isSaving: action.payload };
    case "LOAD_STATE": {
      const payload = { ...action.payload };
      if (payload.resumeData?.summary && typeof payload.resumeData.summary === 'object') {
        payload.resumeData.summary = payload.resumeData.summary.summary || "";
      }
      return { ...initialBuilderState, ...payload, pastResumeData: [], futureResumeData: [] };
    }
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
  const loadResumeData = useCallback(async (resumeId) => {
    if (resumeId === "new") {
      dispatch({ type: "RESET" });
      setCurrentStep(1);
      setActiveResumeId("new");
      activeResumeIdRef.current = "new";
      return;
    }

    setActiveResumeId(resumeId);
    activeResumeIdRef.current = resumeId;
    try {
      const data = await getResume(resumeId);
      if (!data) return;

      dispatch({
        type: "LOAD_STATE",
        payload: {
          bragSheetText: data.bragSheetText ?? "",
          photoURL: data.photoURL ?? null,
          interviewAnswers: data.interviewAnswers ?? initialBuilderState.interviewAnswers,
          templateId: data.templateId ?? null,
          resumeData: data.resumeData ?? null,
          bulletsRewritten: data.bulletsRewritten ?? 0,
        }
      });
      setCurrentStep(getResumeBuilderStep(data));
    } catch (err) {
      console.warn("loadResumeData failed:", err.message);
    }
  }, [getResume]);

  // ─── SAVE ──────────────────────────────────────────────────────────────────
  const debounceRef = useRef(null);

  // Direct (non-debounced) save — used for critical saves at step transitions.
  const saveNow = useCallback(async (dataToMerge) => {
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
        return newId;
      } else {
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
  }, [currentUser, updateResume, createResume]);

  // Debounced save — used for live typing in EditStep
  const saveToFirestore = useCallback((dataToMerge) => {
    if (!currentUser) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    dispatch({ type: "SET_SAVING", payload: true });

    debounceRef.current = setTimeout(async () => {
      const latestId = activeResumeIdRef.current;
      if (!latestId || latestId === "creating" || latestId === "new") {
        dispatch({ type: "SET_SAVING", payload: false });
        return;
      }
      try {
        await updateResume(latestId, { ...dataToMerge, userId: currentUser.uid });
      } catch (err) {
        console.warn("Live save failed:", err.message);
      } finally {
        dispatch({ type: "SET_SAVING", payload: false });
      }
    }, 1000);
  }, [currentUser, updateResume]);

  // ─── STEP NAVIGATION ───────────────────────────────────────────────────────
  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  // ─── DISPATCH HELPERS ──────────────────────────────────────────────────────
  const setBragSheet = useCallback((text, fileName) => {
    dispatch({ type: "SET_BRAG_SHEET", payload: { text, fileName } });
  }, []);

  const setPhoto = useCallback((file, url) => {
    dispatch({ type: "SET_PHOTO", payload: { file, url } });
  }, []);

  const setInterviewAnswers = useCallback((answers) => {
    dispatch({ type: "SET_INTERVIEW_ANSWERS", payload: answers });
  }, []);

  const setTemplateId = useCallback((id) => {
    dispatch({ type: "SET_TEMPLATE_ID", payload: id });
  }, []);

  const setResumeData = useCallback((data) => {
    dispatch({ type: "SET_RESUME_DATA", payload: data });
  }, []);

  const updateSection = useCallback((sectionName, sectionData) => {
    dispatch({ type: "UPDATE_SECTION", payload: { sectionName, sectionData } });
  }, []);

  const resetBuilder = useCallback(() => {
    dispatch({ type: "RESET" });
    setCurrentStep(1);
  }, []);

  const undo = useCallback(() => {
    if (builderData.pastResumeData.length === 0) return;
    const previous = builderData.pastResumeData[builderData.pastResumeData.length - 1];
    dispatch({ type: "UNDO_RESUME" });
    saveToFirestore({ resumeData: previous });
  }, [builderData.pastResumeData, saveToFirestore]);

  const redo = useCallback(() => {
    if (builderData.futureResumeData.length === 0) return;
    const next = builderData.futureResumeData[0];
    dispatch({ type: "REDO_RESUME" });
    saveToFirestore({ resumeData: next });
  }, [builderData.futureResumeData, saveToFirestore]);

  const value = {
    builderData, dispatch,
    setBragSheet, setPhoto, setInterviewAnswers, setTemplateId, setResumeData, updateSection,
    currentStep, goToStep, nextStep, prevStep,
    activeResumeId, saveToFirestore, saveNow, loadResume: loadResumeData, resetBuilder,
    undo, redo, canUndo: builderData.pastResumeData.length > 0, canRedo: builderData.futureResumeData.length > 0
  };
  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}
