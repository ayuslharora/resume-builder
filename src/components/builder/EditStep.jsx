import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../../context/useResume";
import ResumePreview from "../resume/ResumePreview";
import { Wand2, Save, Loader2, FileText, RefreshCw, X, AlertCircle, Sparkles, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import AiRewriteModal from "./AiRewriteModal";
import RichTextToolbar from "./RichTextToolbar";
import { buildResumeTextForAts } from "../../services/resumeTextForAts";

const atsBreakdownLabels = [
  ["formatting", "Formatting"],
  ["keywords", "Keywords"],
  ["impact", "Impact"],
  ["clarity", "Clarity"],
];

export default function EditStep() {
  const { builderData, updateSection, saveNow, activeResumeId, saveToFirestore } = useResume();
  const [activeSection, setActiveSection] = useState("personalInfo");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegeneratingItem, setIsRegeneratingItem] = useState(null);
  const [pendingAIChange, setPendingAIChange] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [rewriteBulletData, setRewriteBulletData] = useState(null);
  const [isAtsPanelOpen, setIsAtsPanelOpen] = useState(false);
  const [isScanningAts, setIsScanningAts] = useState(false);
  const [atsResult, setAtsResult] = useState(null);
  const [atsError, setAtsError] = useState(null);
  const atsScanCacheRef = useRef(new Map());
  const atsScanRequestIdRef = useRef(0);
  const previewContainerRef = useRef(null);
  const navigate = useNavigate();

  const { resumeData, templateId, interviewAnswers, bragSheetText, isSaving } = builderData;

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
      const title = resumeData.personalInfo?.fullName
        ? `${resumeData.personalInfo.fullName} — ${interviewAnswers.targetRole || 'Resume'}`
        : interviewAnswers.targetRole || 'New Resume';
      saveNow({
        resumeData,
        templateId,
        interviewAnswers,
        title,
        targetRole: interviewAnswers.targetRole || "",
        status: "complete",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount — data is already in context

  if (!resumeData) return <div className="p-8 text-center text-gray-500">No resume data found</div>;

  const handleRegenerate = async (sectionToRegenerate) => {
    setIsRegenerating(true);
    try {
      const { regenerateSection } = await import("../../services/llm");
      const dataToRegenerate = resumeData?.[sectionToRegenerate];
      const newData = await regenerateSection(sectionToRegenerate, dataToRegenerate, interviewAnswers, bragSheetText);
      updateSection(sectionToRegenerate, newData);
      setPendingAIChange({
        sectionName: sectionToRegenerate,
        originalData: dataToRegenerate,
        newData
      });
    } catch (err) {
      alert("Failed to regenerate: " + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleRegenerateItem = async (sectionName, itemIndex) => {
    setIsRegeneratingItem(`${sectionName}-${itemIndex}`);
    try {
      const { regenerateItem } = await import("../../services/llm");
      const currentSectionArray = resumeData?.[sectionName] || [];
      const itemToRegenerate = currentSectionArray[itemIndex];
      
      if (!itemToRegenerate) throw new Error("Item not found");

      const newData = await regenerateItem(sectionName, itemToRegenerate, interviewAnswers, bragSheetText);
      
      const updatedSectionArray = [...currentSectionArray];
      updatedSectionArray[itemIndex] = {
        ...newData,
        id: itemToRegenerate.id // preserve the original ID if it existed
      };

      updateSection(sectionName, updatedSectionArray);
      setPendingAIChange({
        sectionName,
        originalData: currentSectionArray,
        newData: updatedSectionArray
      });
    } catch (err) {
      alert("Failed to regenerate item: " + err.message);
    } finally {
      setIsRegeneratingItem(null);
    }
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

  const handleAtsRescan = async () => {
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
        jobDescription: interviewAnswers.additionalContext || "",
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
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full min-h-0 lg:h-[calc(100dvh-190px)] justify-center">
      {isAtsPanelOpen && (
        <button
          type="button"
          aria-label="Close ATS feedback"
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setIsAtsPanelOpen(false)}
        />
      )}

      <aside
        className={`glass-card ghost-border rounded-2xl overflow-hidden shrink-0 order-last transition-all duration-300 ease-in-out fixed inset-x-3 top-[5.5rem] bottom-[calc(7rem+env(safe-area-inset-bottom))] z-40 lg:static lg:order-first ${
          isAtsPanelOpen
            ? "translate-y-0 opacity-100 pointer-events-auto lg:w-[360px]"
            : "translate-y-6 opacity-0 pointer-events-none lg:w-0 lg:border-none"
        } min-h-0 lg:h-full`}
        style={{ background: "rgba(12,18,36,0.82)" }}
      >
        <div className="w-full lg:w-[360px] lg:min-w-[360px] min-h-0 h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-primary/80 uppercase mb-1">
                ATS Feedback
              </div>
              <h3 className="text-sm font-bold text-on-surface">Current Draft Scan</h3>
            </div>
            <button
              onClick={() => setIsAtsPanelOpen(false)}
              className="p-2 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-colors"
              aria-label="Close ATS panel"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <button
              onClick={handleAtsRescan}
              disabled={isScanningAts}
              className="btn-primary w-full"
            >
              {isScanningAts ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Re-scan
            </button>

            {!atsResult && !atsError && (
              <div className="rounded-xl p-4 text-sm text-on-surface-variant leading-relaxed"
                style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                Review the current version of your resume against the target role. Rescans only run when you click the button.
              </div>
            )}

            {atsError && (
              <div className="rounded-xl p-4"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300 leading-relaxed">{atsError}</p>
                </div>
              </div>
            )}

            {atsResult && (
              <>
                <div className="rounded-xl p-4"
                  style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-on-surface-variant mb-2">
                        ATS Score
                      </div>
                      <div className="text-sm text-on-surface">{interviewAnswers.targetRole}</div>
                    </div>
                    <div className="text-3xl font-black text-primary">{atsResult.score}/100</div>
                  </div>
                  <p className="text-sm text-on-surface mb-2">{atsResult.summary}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{atsResult.fitAssessment}</p>
                </div>

                <div className="rounded-xl p-4 space-y-3"
                  style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
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
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${atsResult.atsBreakdown?.[key] ?? 0}%`,
                            background: "linear-gradient(90deg, #06b6d4 0%, #67e8f9 100%)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl p-4"
                  style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-sm font-semibold text-on-surface mb-3">Missing Keywords</div>
                  <div className="space-y-2">
                    {(atsResult.keywordGaps?.length ? atsResult.keywordGaps : ["No major keyword gaps identified."]).map((item, index) => (
                      <div key={`${item}-${index}`} className="text-sm text-on-surface-variant leading-relaxed">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl p-4"
                  style={{ background: "rgba(7,13,31,0.45)", border: "1px solid rgba(255,255,255,0.06)" }}>
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

      {/* ── Right panel: live preview ref'd for PDF/html2canvas capture ── */}
      <div className="flex-1 max-w-[1000px] glass-card ghost-border rounded-2xl flex flex-col relative min-h-[60vh] lg:min-h-0 order-first lg:order-last transition-all duration-300">
        <div className="bg-surface-lowest/80 backdrop-blur-md border-b border-white/5 p-3 sm:px-5 sm:py-3 flex flex-wrap gap-3 justify-between items-center z-50 sticky top-0 lg:top-[85px] rounded-t-2xl">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={() => setIsAtsPanelOpen(!isAtsPanelOpen)}
              className="p-1.5 text-on-surface hover:bg-white/10 rounded transition-colors bg-white/5 mr-2"
              title="Toggle ATS Feedback Panel"
            >
              {isAtsPanelOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
            <div className="hidden sm:flex w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
            <span className="hidden sm:block text-[11px] font-bold tracking-[0.2em] text-cyan-400/80 uppercase">
              Live Preview
            </span>
          </div>
          
          <div className="order-last w-full sm:order-none sm:w-auto">
            <RichTextToolbar />
          </div>

          <div className="flex w-full sm:w-auto flex-wrap gap-3 sm:items-center sm:justify-end">
            {pendingAIChange ? (
              <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 bg-blue-500/10 border border-blue-500/30 pl-3 pr-1 py-1 rounded-lg animate-in fade-in zoom-in-95">
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1.5 mr-2">
                  <Wand2 size={12}/> Review AI Change
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
            ) : (
              isSaving ? (
                <span className="text-[10px] font-mono text-cyan-500/60 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                  <Loader2 size={12} className="inline mr-1 animate-spin" />
                  SAVING
                </span>
              ) : (
                <span className="text-[10px] font-mono text-cyan-500/60 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                  <Save size={12} className="inline mr-1" />
                  AUTO-SAVED
                </span>
              )
            )}
            <button
              onClick={handleAtsRescan}
              disabled={isScanningAts}
              className="btn-ghost w-full sm:w-auto"
            >
              {isScanningAts ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Re-scan
            </button>
            <button 
              onClick={async () => {
                await saveNow({ status: "complete" });
                navigate(`/export/${activeResumeId}`, { state: { builderData } });
              }}
              className="bg-primary text-surface rounded-md px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-ambient w-full sm:w-auto"
            >
              <FileText size={14} /> 
              Complete Rendering
            </button>
          </div>
        </div>

        <div 
          ref={previewContainerRef}
          className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-auto lg:overflow-x-hidden custom-scrollbar p-2 sm:p-4 lg:p-10 flex justify-start sm:justify-center relative"
          style={{
            backgroundColor: "#0b1021",
            backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        >
          {/* Ambient Glow Behind Document */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div 
            className="bg-white relative z-10 transition-transform duration-200" 
            style={{ 
              width: "794px", 
              zoom: previewScale, // Use zoom to accurately shrink the bounding box and prevent scrollbars
              transformOrigin: isMobilePreview ? "top left" : "top center",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -15px rgba(0,0,0,0.6), 0 0 50px rgba(6, 182, 212, 0.15)",
              borderRadius: "4px"
            }}
          >
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
                jobDescription: interviewAnswers.additionalContext,
                resumeText: buildResumeTextForAts(resumeData),
                sourceDocumentText: bragSheetText,
              }}
              onClose={() => setRewriteBulletData(null)}
              onSelect={handleApplyBulletRewrite}
            />
          )}

        </div>
      </div>
    </div>
  );
}
