import { useState, useEffect, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../../context/useResume";
import ResumePreview from "../resume/ResumePreview";
import { templates } from "../templates";
import { Wand2, CheckCircle2, Loader2, Play, RefreshCw, X, AlertCircle, Sparkles, PanelLeftClose, PanelLeftOpen, ChevronLeft, ChevronRight, Scissors, Minus, Plus } from "lucide-react";
import AiRewriteModal from "./AiRewriteModal";
import SectionAiRewriteModal from "./SectionAiRewriteModal";
import ItemAiRewriteModal from "./ItemAiRewriteModal";
import RichTextToolbar from "./RichTextToolbar";
import { buildResumeTextForAts } from "../../services/resumeTextForAts";
import { useKeyboardShortcut } from "../../hooks/useKeyboardShortcut";
import { triggerActiveRewrite } from "../resume/InlineEdit";
import { POPULAR_RESUME_FONTS, DEFAULT_RESUME_FONT_SIZE, getResumeTypographyStyle } from "../../services/resumeTypography";

const atsBreakdownLabels = [
  ["formatting", "Formatting"],
  ["keywords", "Keywords"],
  ["impact", "Impact"],
  ["clarity", "Clarity"],
];

export default function EditStep() {
  const { builderData, updateSection, saveNow, activeResumeId, saveToFirestore, undo, redo, canUndo, canRedo } = useResume();
  const [activeSection, setActiveSection] = useState("personalInfo");
  const [isRegenerating] = useState(false);
  const [isRegeneratingItem] = useState(null);
  const [pendingAIChange, setPendingAIChange] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [localFontSize, setLocalFontSize] = useState(DEFAULT_RESUME_FONT_SIZE);
  const [fontSizeInput, setFontSizeInput] = useState(String(DEFAULT_RESUME_FONT_SIZE));
  const [localFontFamily, setLocalFontFamily] = useState(POPULAR_RESUME_FONTS[0].value);
  const [fontPickerOpen, setFontPickerOpen] = useState(false);
  const fontPickerRef = useRef(null);
  const [rewriteBulletData, setRewriteBulletData] = useState(null);
  const [sectionRewriteData, setSectionRewriteData] = useState(null);
  const [rewriteItemData, setRewriteItemData] = useState(null);
  const [isAtsPanelOpen, setIsAtsPanelOpen] = useState(false);
  const [isScanningAts, setIsScanningAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState(null);
  const [resumeHeight, setResumeHeight] = useState(0);
  const [isFittingMe, setIsFittingMe] = useState(false);
  const atsScanCacheRef = useRef(new Map());
  const atsScanRequestIdRef = useRef(0);
  const previewContainerRef = useRef(null);
  const resumeDocRef = useRef(null);
  const resumeSelectionRef = useRef(null); // last selection inside any contenteditable
  const navigate = useNavigate();

  const { resumeData, templateId, interviewAnswers, bragSheetText, isSaving } = builderData;
  const scaledPreviewWidth = 794 * previewScale;

  // Dynamic scaling for the preview container
  useEffect(() => {
    if (!previewContainerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        const targetWidth = 794;
        const isMobileViewport = width < 640;
        setIsMobilePreview(isMobileViewport);
        const availableWidth = width - (isMobileViewport ? 12 : 64);
        
        if (availableWidth < targetWidth && availableWidth > 0) {
          const newScale = availableWidth / targetWidth;
          setPreviewScale(
            isMobileViewport
              ? Math.min(0.72, Math.max(0.52, newScale))
              : Math.min(1, Math.max(0.3, newScale))
          );
        } else {
          setPreviewScale(1);
        }
      }
    });
    
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Track the last selection the user made inside any contenteditable (resume text fields).
  // Also reads the computed font size/family at the selection so the toolbar reflects current state.
  useEffect(() => {
    const onSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      while (node) {
        if (node.isContentEditable) {
          resumeSelectionRef.current = range.cloneRange();
          // Read computed styles from the deepest element at the selection point.
          const el = range.startContainer.nodeType === 1
            ? range.startContainer
            : range.startContainer.parentElement;
          if (el) {
            const computed = window.getComputedStyle(el);
            const pxSize = parseFloat(computed.fontSize);
            if (!isNaN(pxSize)) {
              const rounded = Math.round(pxSize);
              setLocalFontSize(rounded);
              setFontSizeInput(String(rounded));
            }
            const family = computed.fontFamily;
            if (family) {
              const match = POPULAR_RESUME_FONTS.find(f =>
                f.value.split(',')[0].trim().replace(/['"]/g, '').toLowerCase() ===
                family.split(',')[0].trim().replace(/['"]/g, '').toLowerCase()
              );
              if (match) setLocalFontFamily(match.value);
            }
          }
          return;
        }
        node = node.parentNode;
      }
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  useEffect(() => {
    if (!fontPickerOpen) return;
    const onClickOutside = (e) => {
      if (fontPickerRef.current && !fontPickerRef.current.contains(e.target)) {
        setFontPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [fontPickerOpen]);

  // Callback ref: attaches ResizeObserver the moment the shadow div mounts.
  const shadowCallbackRef = (el) => {
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setResumeHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
  };

  function buildCompleteResumeSavePayload() {
    const title = resumeData.personalInfo?.fullName
      ? `${resumeData.personalInfo.fullName} — ${interviewAnswers.targetRole || 'Resume'}`
      : interviewAnswers.targetRole || 'New Resume';

    return {
      resumeData,
      templateId,
      interviewAnswers,
      title,
      targetRole: interviewAnswers.targetRole || "",
      status: "complete",
    };
  }

  useEffect(() => {
    if (isAtsPanelOpen) {
      document.body.classList.add("ats-panel-open");
    } else {
      document.body.classList.remove("ats-panel-open");
    }

    return () => {
      document.body.classList.remove("ats-panel-open");
    };
  }, [isAtsPanelOpen]);

  // Save immediately when entering EditStep — this is the critical save
  useEffect(() => {
    if (resumeData) {
      saveNow(buildCompleteResumeSavePayload());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — data is already in context

  useKeyboardShortcut("s", () => {
    if (resumeData) {
      saveNow(buildCompleteResumeSavePayload());
    }
  });

  useKeyboardShortcut("/", () => {
    setIsAtsPanelOpen(prev => !prev);
  });

  async function handleCompleteRendering() {
    if (!activeResumeId || !resumeData) return;

    const completeResumePayload = buildCompleteResumeSavePayload();
    const savedResumeId = await saveNow(completeResumePayload);
    const exportResumeId = savedResumeId || activeResumeId;

    navigate(`/export/${exportResumeId}`, {
      state: {
        builderData: { ...builderData, ...completeResumePayload },
      },
    });
  }

  useKeyboardShortcut("p", () => {
    if (activeResumeId) {
      handleCompleteRendering();
    }
  });

  useKeyboardShortcut("g", () => {
    if (!isScanningAts) {
      handleAtsRescan();
    }
  });

  useKeyboardShortcut("z", () => {
    if (canUndo) undo();
  }, { global: true });

  useKeyboardShortcut("r", () => {
    triggerActiveRewrite();
  }, { global: false });

  if (!resumeData) return <div className="p-8 text-center text-gray-500">No resume data found</div>;

  const handleRegenerate = (sectionToRegenerate) => {
    setSectionRewriteData(sectionToRegenerate);
  };

  const handleSectionGenerated = (newData) => {
    if (!sectionRewriteData) return;
    const sectionName = sectionRewriteData;
    const originalData = resumeData[sectionName];
    
    updateSection(sectionName, newData);
    setPendingAIChange({
      sectionName,
      originalData,
      newData
    });
    setSectionRewriteData(null);
  };

  // Opens the instruction modal — actual rewrite happens in handleItemGenerated.
  const handleRegenerateItem = (sectionName, itemIndex) => {
    setRewriteItemData({ sectionName, itemIndex });
  };

  const handleItemGenerated = async (newData) => {
    if (!rewriteItemData) return;
    const { sectionName, itemIndex } = rewriteItemData;
    const currentSectionArray = resumeData?.[sectionName] || [];
    const originalItem = currentSectionArray[itemIndex];
    const updatedSectionArray = [...currentSectionArray];
    updatedSectionArray[itemIndex] = { ...newData, id: originalItem?.id };
    updateSection(sectionName, updatedSectionArray);
    setPendingAIChange({
      sectionName,
      originalData: currentSectionArray,
      newData: updatedSectionArray,
    });
    setRewriteItemData(null);
  };

  const handleRewriteBulletRequest = (sectionName, itemId, bulletIdx, currentText) => {
    setRewriteBulletData({ sectionName, itemId, bulletIdx, currentText });
  };

  const handleApplyBulletRewrite = (newBulletText) => {
    if (!rewriteBulletData) return;
    const { sectionName, itemId, bulletIdx } = rewriteBulletData;
    
    const currentSection = resumeData[sectionName] || [];
    const updatedSection = currentSection.map(item => {
      if (item.id === itemId) {
        const newBullets = [...(item.bullets || [])];
        newBullets[bulletIdx] = newBulletText;
        return { ...item, bullets: newBullets };
      }
      return item;
    });
    
    updateSection(sectionName, updatedSection);
    saveToFirestore({
      resumeData: {
        ...resumeData,
        [sectionName]: updatedSection
      }
    });
    setRewriteBulletData(null);
  };

  const handleUpdateBullet = (sectionName, itemId, bulletIdx, newValue) => {
    const currentSection = resumeData[sectionName] || [];
    const updatedSection = currentSection.map(item => {
      if (item.id === itemId) {
        let newBullets = [...(item.bullets || [])];
        newBullets[bulletIdx] = newValue;
        // Auto-remove empty bullets (strip HTML tags first to handle <b></b> or <br>)
        newBullets = newBullets.filter(b => {
          if (!b) return false;
          const textContent = b.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
          return textContent !== "";
        });
        return { ...item, bullets: newBullets };
      }
      return item;
    });
    updateSection(sectionName, updatedSection);
    saveToFirestore({
      resumeData: {
        ...resumeData,
        [sectionName]: updatedSection
      }
    });
  };

  const handleAddBullet = (sectionName, itemId) => {
    const currentSection = resumeData[sectionName] || [];
    const updatedSection = currentSection.map(item => {
      if (item.id === itemId) {
        const newBullets = [...(item.bullets || []), "New Bullet"];
        return { ...item, bullets: newBullets };
      }
      return item;
    });
    updateSection(sectionName, updatedSection);
    saveToFirestore({
      resumeData: {
        ...resumeData,
        [sectionName]: updatedSection
      }
    });
  };

  const handleAcceptAIChange = () => {
    if (!pendingAIChange) return;
    saveToFirestore({
      resumeData: {
        ...resumeData,
        [pendingAIChange.sectionName]: pendingAIChange.newData
      }
    });
    setPendingAIChange(null);
  };

  const handleDiscardAIChange = () => {
    if (!pendingAIChange) return;
    updateSection(pendingAIChange.sectionName, pendingAIChange.originalData);
    setPendingAIChange(null);
  };

  const handleSectionClick = (sectionName) => {
    if (pendingAIChange) return; // Prevent switching sections while reviewing AI change
    setActiveSection(sectionName);
  };

  const handleSectionUpdate = (section, newData) => {
    updateSection(section, newData);
    saveToFirestore({
      resumeData: {
        ...resumeData,
        [section]: newData
      }
    });
  };

  const handleTypographyChange = (field, value) => {
    const nextTheme = {
      ...(resumeData.theme || {}),
      [field]: value,
    };

    updateSection("theme", nextTheme);
    saveToFirestore({
      resumeData: {
        ...resumeData,
        theme: nextTheme,
      },
    });
  };

  const wrapSelectionWithSpan = (styleProp, styleVal) => {
    const sel = window.getSelection();
    let range = null;

    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      range = sel.getRangeAt(0).cloneRange();
    } else if (resumeSelectionRef.current && !resumeSelectionRef.current.collapsed) {
      range = resumeSelectionRef.current.cloneRange();
    } else {
      return false;
    }

    // Walk up to the actual [contenteditable] element (not just isContentEditable which is
    // true on ALL elements inside a CE). Focus it so the browser allows DOM modifications.
    let ce = range.startContainer;
    while (ce && !(ce.nodeType === 1 && ce.hasAttribute?.('contenteditable'))) {
      ce = ce.parentNode;
    }
    if (ce) {
      ce.focus();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const span = document.createElement('span');
    span.style[styleProp] = styleVal;

    try {
      range.surroundContents(span);
    } catch {
      try {
        const extracted = range.extractContents();
        span.appendChild(extracted);
        range.insertNode(span);
      } catch {
        return false;
      }
    }

    // Re-select the newly inserted span so consecutive changes work without re-selecting.
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
    resumeSelectionRef.current = newRange.cloneRange();

    return true;
  };

  // Per-selection font changes are stored in the HTML content of each field (via InlineEdit's
  // handleBlur → onChange), NOT in resumeData.theme. Local state updates avoid triggering a
  // full re-render that can overwrite the contenteditable DOM before the blur saves it.
  const applyFontFamily = (family) => {
    if (wrapSelectionWithSpan('fontFamily', family)) {
      setLocalFontFamily(family);
    }
  };

  const applyFontSize = (sizePx) => {
    const clamped = Math.min(84, Math.max(12, sizePx));
    if (wrapSelectionWithSpan('fontSize', clamped + 'px')) {
      setLocalFontSize(clamped);
      setFontSizeInput(String(clamped));
    }
  };

  async function handleAtsRescan() {
    setIsAtsPanelOpen(true);
    setAtsError(null);

    if (!interviewAnswers.targetRole?.trim()) {
      setAtsResult(null);
      setAtsError("Add a target role before running an ATS rescan.");
      return;
    }

    try {
      const resumeText = buildResumeTextForAts(resumeData);
      const scanContext = {
        targetRole: interviewAnswers.targetRole,
        jobDescription: interviewAnswers.jobDescription || "",
        reviewTone: "ATS strict",
      };
      const scanKey = JSON.stringify({ resumeText, ...scanContext });

      if (atsScanCacheRef.current.has(scanKey)) {
        setAtsResult(atsScanCacheRef.current.get(scanKey));
        return;
      }

      setIsScanningAts(true);
      const requestId = ++atsScanRequestIdRef.current;
      const { gradeResume } = await import("../../services/llm");
      const result = await gradeResume(resumeText, scanContext);
      if (requestId !== atsScanRequestIdRef.current) return;
      atsScanCacheRef.current.set(scanKey, result);
      setAtsResult(result);
    } catch (err) {
      if (atsScanRequestIdRef.current > 0) {
        // Keep latest request winner semantics if multiple scans are triggered quickly.
      }
      setAtsError(err.message);
    } finally {
      setIsScanningAts(false);
    }
  }

  const atsCardStyle = { background: "var(--surface)", border: "1px solid var(--border)" };
  const currentFontFamily = localFontFamily;
  const currentFontSize = localFontSize;
  const previewTypographyStyle = getResumeTypographyStyle(resumeData.theme);

  const overflowPx = resumeHeight > 0 ? Math.round(resumeHeight - 1122) : 0;

  const handleFitMe = async () => {
    setIsFittingMe(true);
    try {
      const allBullets = [];
      ["experience", "projects"].forEach((sectionName) => {
        const section = resumeData[sectionName] || [];
        section.forEach((item) => {
          (item.bullets || []).forEach((bullet, bulletIdx) => {
            const wordCount = (bullet || "").replace(/<[^>]*>?/gm, "").trim().split(/\s+/).filter(Boolean).length;
            allBullets.push({ sectionName, itemId: item.id, bulletIdx, bullet, wordCount });
          });
        });
      });

      allBullets.sort((a, b) => b.wordCount - a.wordCount);
      const N = Math.min(Math.ceil(overflowPx / 28), 4);
      const topBullets = allBullets.slice(0, N);

      const { rewriteResumeBullet } = await import("../../services/llm");
      const context = { targetRole: interviewAnswers.targetRole, jobDescription: interviewAnswers.jobDescription || "" };

      const rewrites = await Promise.all(
        topBullets.map(({ bullet, sectionName, itemId, bulletIdx }) =>
          rewriteResumeBullet(typeof bullet === "string" ? bullet : "", { ...context, customInstruction: "Shorten to under 15 words while keeping the core achievement. Cut filler words. Keep the action verb and the key metric." })
            .then((result) => ({ sectionName, itemId, bulletIdx, newText: result?.rewrites?.[0]?.version || (typeof bullet === "string" ? bullet : "") }))
        )
      );

      const changes = {};
      rewrites.forEach(({ sectionName, itemId, bulletIdx, newText }) => {
        if (!changes[sectionName]) changes[sectionName] = {};
        if (!changes[sectionName][itemId]) changes[sectionName][itemId] = {};
        changes[sectionName][itemId][bulletIdx] = newText;
      });

      // Build the full updated resumeData so we can persist everything in one save.
      const updatedResumeData = { ...resumeData };
      Object.entries(changes).forEach(([sectionName, itemChanges]) => {
        const updatedSection = (resumeData[sectionName] || []).map((item) => {
          if (!itemChanges[item.id]) return item;
          const newBullets = [...(item.bullets || [])];
          Object.entries(itemChanges[item.id]).forEach(([idx, text]) => {
            newBullets[Number(idx)] = text;
          });
          return { ...item, bullets: newBullets };
        });
        updatedResumeData[sectionName] = updatedSection;
        updateSection(sectionName, updatedSection);
      });

      saveToFirestore({ resumeData: updatedResumeData });
    } catch {
      // swallow errors from fit-me operation
    } finally {
      setIsFittingMe(false);
    }
  };

  return (
    <div className="app-design flex flex-col lg:flex-row gap-4 lg:gap-6 w-full min-h-0 lg:h-[calc(100dvh-190px)] justify-center">
      {isAtsPanelOpen && (
        <button
          type="button"
          aria-label="Close ATS feedback"
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsAtsPanelOpen(false)}
        />
      )}

      <aside
        className={`app-design ats-feedback-panel panel rounded-xl overflow-hidden shrink-0 order-last transition-all duration-300 ease-in-out fixed inset-x-3 top-[5.5rem] bottom-[calc(7rem+env(safe-area-inset-bottom))] z-40 lg:static lg:order-first ${
          isAtsPanelOpen
            ? "translate-y-0 opacity-100 pointer-events-auto lg:w-[360px]"
            : "translate-y-6 opacity-0 pointer-events-none lg:w-0 lg:border-none"
        } min-h-0 lg:h-full`}
      >
        <div className="w-full lg:w-[360px] lg:min-w-[360px] min-h-0 h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div>
              <div className="lbl-mono mb-1">
                ATS Feedback
              </div>
              <h3 className="text-sm font-semibold text-on-surface">Current Draft Scan</h3>
            </div>
            <button
              onClick={() => setIsAtsPanelOpen(false)}
              className="btn btn-ghost btn-sm !h-8 !w-8 !p-0"
              aria-label="Close ATS panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <button
              onClick={handleAtsRescan}
              disabled={isScanningAts}
              className="btn-accent w-full"
            >
              {isScanningAts ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Re-scan
            </button>

            {!atsResult && !atsError && (
              <div className="ats-feedback-card rounded-xl p-4 text-sm text-on-surface-variant leading-relaxed"
                style={atsCardStyle}>
                Review the current version of your resume against the target role. Rescans only run when you click the button.
              </div>
            )}

            {atsError && (
              <div className="ats-feedback-card rounded-xl p-4"
                style={{ background: "var(--bad-soft)", border: "1px solid rgba(185,28,28,0.18)" }}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm leading-relaxed" style={{ color: "var(--bad)" }}>{atsError}</p>
                </div>
              </div>
            )}

            {atsResult && (
              <>
                <div className="ats-feedback-card rounded-xl p-4"
                  style={atsCardStyle}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="lbl-mono mb-2">
                        ATS Score
                      </div>
                      <div className="text-sm text-on-surface">{interviewAnswers.targetRole}</div>
                    </div>
                    <div className="text-3xl font-black text-primary">{atsResult.score}/100</div>
                  </div>
                  <p className="text-sm text-on-surface mb-2">{atsResult.summary}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{atsResult.fitAssessment}</p>
                </div>

                <div className="ats-feedback-card rounded-xl p-4 space-y-3"
                  style={atsCardStyle}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-on-surface">
                    <Sparkles size={16} className="text-primary" />
                    ATS Breakdown
                  </div>
                  {atsBreakdownLabels.map(([key, label]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-on-surface">{label}</span>
                        <span className="text-on-surface-variant">{atsResult.atsBreakdown?.[key] ?? 0}/100</span>
                      </div>
                      <div className="scorebar">
                        <div
                          style={{
                            width: `${atsResult.atsBreakdown?.[key] ?? 0}%`,
                            background: "var(--accent)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ats-feedback-card rounded-xl p-4"
                  style={atsCardStyle}>
                  <div className="text-sm font-semibold text-on-surface mb-3">Missing Keywords</div>
                  <div className="space-y-2">
                    {(atsResult.keywordGaps?.length ? atsResult.keywordGaps : ["No major keyword gaps identified."]).map((item, index) => (
                      <div key={`${item}-${index}`} className="text-sm text-on-surface-variant leading-relaxed">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="ats-feedback-card rounded-xl p-4"
                  style={atsCardStyle}>
                  <div className="text-sm font-semibold text-on-surface mb-3">Top Priority Fixes</div>
                  <div className="space-y-3">
                    {(atsResult.priorityFixes || []).slice(0, 3).map((fix, index) => (
                      <div key={`${fix.issue}-${index}`}>
                        <div className="text-sm font-medium text-on-surface mb-1">{fix.issue}</div>
                        <div className="text-sm text-on-surface-variant leading-relaxed">{fix.howToFix}</div>
                      </div>
                    ))}
                    {(!atsResult.priorityFixes || atsResult.priorityFixes.length === 0) && (
                      <div className="text-sm text-on-surface-variant">No major fixes surfaced in this scan.</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Live preview ref'd for PDF/html2canvas capture ── */}
      <div
        className="builder-live-preview flex-1 max-w-[1000px] rounded-2xl flex flex-col relative min-h-[60vh] lg:min-h-0 order-first lg:order-last transition-all duration-300"
        style={{ background: "var(--builder-form-surface)", border: "1px solid var(--builder-form-border-soft)", boxShadow: "0 18px 40px -28px rgba(15,15,20,0.22), 0 1px 2px rgba(15,15,20,0.04)" }}
      >
        <div
          className="builder-live-preview-toolbar z-50 sticky top-0 lg:top-[85px] rounded-t-2xl border-b"
          style={{ background: "var(--builder-form-surface)", borderColor: "var(--builder-form-border-soft)" }}
        >
          {/* ── Row 1: typography · formatting · status ── */}
          <div
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 border-b"
            style={{ borderColor: "var(--builder-form-border-soft)" }}
          >
            <button
              onClick={() => setIsAtsPanelOpen(!isAtsPanelOpen)}
              className="h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
              title="Toggle ATS Feedback Panel"
            >
              {isAtsPanelOpen ? <PanelLeftClose size={15} /> : <PanelLeftOpen size={15} />}
            </button>

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
              <span className="text-[13px] font-medium text-on-surface hidden sm:block">Live</span>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${canUndo ? "text-on-surface hover:bg-surface-container" : "text-on-surface-variant/40 cursor-not-allowed"}`}
                title="Undo"
              >
                <ChevronLeft size={15} />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`h-7 w-7 flex items-center justify-center rounded transition-colors ${canRedo ? "text-on-surface hover:bg-surface-container" : "text-on-surface-variant/40 cursor-not-allowed"}`}
                title="Redo"
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div className="h-5 w-px bg-surface-container-high flex-shrink-0" aria-hidden="true" />

            <div ref={fontPickerRef} className="relative" aria-label="Resume font family">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setFontPickerOpen((o) => !o);
                }}
                className="h-8 w-24 flex items-center justify-between gap-1 rounded-lg border border-surface-container-high bg-surface-container px-2 text-[12px] font-medium text-on-surface cursor-pointer hover:bg-surface-container-high transition-colors"
                style={{ fontFamily: currentFontFamily }}
              >
                <span className="truncate">{POPULAR_RESUME_FONTS.find(f => f.value === currentFontFamily)?.label ?? 'Arial'}</span>
                <ChevronRight size={10} className={`flex-shrink-0 transition-transform ${fontPickerOpen ? 'rotate-90' : 'rotate-90 opacity-50'}`} />
              </button>
              {fontPickerOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] rounded-lg border border-surface-container-high bg-surface shadow-lg overflow-hidden">
                  {POPULAR_RESUME_FONTS.map((font) => (
                    <button
                      key={font.value}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFontFamily(font.value);
                        setFontPickerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[13px] hover:bg-surface-container transition-colors ${currentFontFamily === font.value ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant'}`}
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="inline-flex items-center h-8 rounded-lg border border-surface-container-high bg-surface-container overflow-hidden">
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFontSize(currentFontSize - 1); }}
                disabled={currentFontSize <= 12}
                className="h-full px-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                <Minus size={11} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={fontSizeInput}
                onChange={(e) => setFontSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const n = parseInt(fontSizeInput, 10);
                    if (!isNaN(n)) applyFontSize(n);
                  }
                }}
                onBlur={() => {
                  const n = parseInt(fontSizeInput, 10);
                  if (!isNaN(n)) applyFontSize(n);
                  else setFontSizeInput(String(currentFontSize));
                }}
                className="w-7 text-center text-[12px] font-medium text-on-surface tabular-nums bg-transparent border-none outline-none"
                aria-label="Font size"
              />
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applyFontSize(currentFontSize + 1); }}
                disabled={currentFontSize >= 84}
                className="h-full px-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-l border-surface-container-high transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Increase font size"
                title="Increase font size"
              >
                <Plus size={11} />
              </button>
            </div>

            <div className="h-5 w-px bg-surface-container-high flex-shrink-0" aria-hidden="true" />

            <RichTextToolbar flat />

            <div className="flex-1" />

            {pendingAIChange ? (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 pl-3 pr-1 py-1 rounded-lg animate-in fade-in zoom-in-95">
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5">
                  <Wand2 size={12} /> Review AI Change
                </span>
                <button
                  onClick={handleDiscardAIChange}
                  className="px-3 py-1 text-[11px] font-bold text-gray-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleAcceptAIChange}
                  className="px-3 py-1 font-bold bg-blue-600 hover:bg-blue-500 text-white rounded shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all"
                >
                  Keep
                </button>
              </div>
            ) : isSaving ? (
              <div className="flex items-center gap-1.5 text-[12px] text-on-surface-variant">
                <Loader2 size={14} className="animate-spin" />
                <span className="hidden sm:block">Saving</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[12px] text-emerald-500">
                <CheckCircle2 size={15} />
                <span className="hidden sm:block">Saved</span>
              </div>
            )}
          </div>

          {/* ── Row 2: fit / overflow · actions ── */}
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2">
            {overflowPx >= 10 && (
              <button
                onClick={handleFitMe}
                disabled={isFittingMe}
                className="flex items-center gap-1.5 text-[13px] text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                title="Auto-shorten longest bullets to fit one page"
              >
                {isFittingMe ? <Loader2 size={13} className="animate-spin" /> : <Scissors size={13} />}
                Fit
              </button>
            )}
            {resumeHeight > 200 && (
              <span
                className="text-[11px] font-mono px-2.5 py-1 rounded-md"
                style={
                  overflowPx > 30
                    ? { color: "rgb(239,68,68)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }
                    : overflowPx > 0
                    ? { color: "rgb(217,119,6)", background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.25)" }
                    : { color: "var(--accent)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }
                }
              >
                {overflowPx > 0
                  ? `${overflowPx > 30 ? "✕" : "⚠"} ${overflowPx}px over`
                  : "✓ fits"}
              </span>
            )}

            <div className="flex-1" />

            <button
              onClick={handleAtsRescan}
              disabled={isScanningAts}
              className="btn-ghost h-10 w-full !border-[#d4d4d8] sm:w-auto"
            >
              {isScanningAts ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Re-scan
            </button>
            <button
              onClick={handleCompleteRendering}
              className="btn-primary h-10 rounded-md px-4 text-xs font-bold flex items-center justify-center gap-2 transition w-full sm:w-auto"
            >
              <Play size={14} />
              Render
            </button>
          </div>
        </div>

        <div 
          ref={previewContainerRef}
          className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto lg:overflow-x-hidden custom-scrollbar p-2 sm:p-4 lg:p-10 flex justify-start sm:justify-center relative"
          style={{
            backgroundColor: "var(--builder-form-surface-muted)",
            backgroundImage: "radial-gradient(color-mix(in oklch, var(--builder-form-border-soft) 85%, transparent) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        >
          {/* Ambient Glow Behind Document */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] blur-[120px] rounded-full pointer-events-none" style={{ background: "var(--accent-soft)" }}></div>

          <div
            ref={resumeDocRef}
            className="bg-white relative z-10 transition-transform duration-200"
            style={{
              ...previewTypographyStyle,
              width: isMobilePreview ? `${scaledPreviewWidth}px` : "794px",
              minWidth: isMobilePreview ? `${scaledPreviewWidth}px` : "794px",
              transform: isMobilePreview ? `scale(${previewScale})` : undefined,
              zoom: isMobilePreview ? undefined : previewScale,
              transformOrigin: isMobilePreview ? "top left" : "top center",
              boxShadow: "0 0 0 1px rgba(15,15,20,0.06), 0 30px 60px -20px rgba(15,15,20,0.24), 0 0 50px rgba(37,99,235,0.08)",
              borderRadius: "4px"
            }}
          >
            {resumeHeight > 200 && resumeHeight > 980 && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 50,
                  overflow: "visible",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 1050,
                    left: 0,
                    right: 0,
                    height: 72,
                    background: "rgba(239,68,68,0.07)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 1122,
                    left: 0,
                    right: 0,
                    borderTop: "2px dashed rgba(239,68,68,0.65)",
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingRight: 6,
                    paddingTop: 2,
                  }}
                >
                  <span style={{ fontSize: 9, color: "rgba(239,68,68,0.75)", fontFamily: "monospace", lineHeight: 1 }}>
                    ↑ page 1 end
                  </span>
                </div>
              </div>
            )}
            <ResumePreview
              resumeData={resumeData}
              templateId={templateId}
              isEditing={true}
              activeSection={activeSection}
              onSectionClick={handleSectionClick}
              onUpdateSection={handleSectionUpdate}
              onRegenerate={!pendingAIChange ? handleRegenerate : null}
              isRegenerating={isRegenerating}
              onRegenerateItem={!pendingAIChange ? handleRegenerateItem : null}
              isRegeneratingItem={isRegeneratingItem}
              onRewriteBulletRequest={handleRewriteBulletRequest}
              onUpdateBullet={handleUpdateBullet}
              onAddBullet={handleAddBullet}
              scale={1} // Override default scale, since we zoom the parent container
            />
          </div>
          
          {rewriteBulletData && (
            <AiRewriteModal
              data={rewriteBulletData}
              context={{
                targetRole: interviewAnswers.targetRole,
                jobDescription: interviewAnswers.jobDescription || "",
                resumeText: buildResumeTextForAts(resumeData),
                sourceDocumentText: bragSheetText,
              }}
              onClose={() => setRewriteBulletData(null)}
              onSelect={handleApplyBulletRewrite}
            />
          )}

          {sectionRewriteData && (
            <SectionAiRewriteModal
              sectionName={sectionRewriteData}
              currentData={resumeData[sectionRewriteData]}
              context={interviewAnswers}
              bragSheetText={bragSheetText}
              onClose={() => setSectionRewriteData(null)}
              onGenerated={handleSectionGenerated}
            />
          )}

          {rewriteItemData && (
            <ItemAiRewriteModal
              sectionName={rewriteItemData.sectionName}
              itemIndex={rewriteItemData.itemIndex}
              currentItemData={(resumeData[rewriteItemData.sectionName] || [])[rewriteItemData.itemIndex]}
              context={interviewAnswers}
              bragSheetText={bragSheetText}
              onClose={() => setRewriteItemData(null)}
              onGenerated={handleItemGenerated}
            />
          )}

        </div>
      </div>

      {/* Hidden shadow render — isEditing=false at natural 794px, no zoom.
          Matches what Puppeteer sees: empty sections hidden, real font layout. */}
      {templates[templateId] && (() => {
        const { component: TemplateComponent } = templates[templateId];
        return (
          <div
            ref={shadowCallbackRef}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: '-9999px',
              width: '794px',
              visibility: 'hidden',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            <Suspense fallback={null}>
              <div style={previewTypographyStyle}>
                <TemplateComponent resumeData={resumeData} isEditing={false} />
              </div>
            </Suspense>
          </div>
        );
      })()}
    </div>
  );
}
