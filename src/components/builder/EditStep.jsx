import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../../context/ResumeContext";
import ResumePreview from "../resume/ResumePreview";
import { Wand2, Save, Loader2, FileText } from "lucide-react";

export default function EditStep() {
  const { builderData, updateSection, saveNow, activeResumeId, saveToFirestore } = useResume();
  const [activeSection, setActiveSection] = useState("personalInfo");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegeneratingItem, setIsRegeneratingItem] = useState(null);
  const [pendingAIChange, setPendingAIChange] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef(null);
  const navigate = useNavigate();

  const { resumeData, templateId, interviewAnswers, bragSheetText, isSaving } = builderData;

  const currentSectionData = resumeData?.[activeSection];

  // Dynamic scaling for the preview container
  useEffect(() => {
    if (!previewContainerRef.current) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        // The resume width is 794px. Add 64px padding (32px on each side).
        const targetWidth = 794;
        const availableWidth = width - 64;
        
        if (availableWidth < targetWidth && availableWidth > 0) {
          const newScale = availableWidth / targetWidth;
          setPreviewScale(Math.min(1, Math.max(0.3, newScale)));
        } else {
          setPreviewScale(1);
        }
      }
    });
    
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

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
      const { regenerateSection } = await import("../../services/groq");
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
      const { regenerateItem } = await import("../../services/groq");
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

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full lg:h-[calc(100vh-140px)] justify-center">
      {/* ── Right panel: live preview ref'd for PDF/html2canvas capture ── */}
      <div className="flex-1 max-w-[1000px] glass-card ghost-border rounded-2xl flex flex-col overflow-hidden relative min-h-[60vh] lg:min-h-0 order-first lg:order-last">
        <div className="bg-surface-lowest/80 backdrop-blur-md border-b border-white/5 p-3 px-5 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-cyan-400/80 uppercase">
              Live Preview (Click text to edit)
            </span>
          </div>
          <div className="flex items-center gap-4">
            {pendingAIChange ? (
              <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 pl-3 pr-1 py-1 rounded-lg animate-in fade-in zoom-in-95">
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
                  className="px-3 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-500 text-white rounded shadow-[0_0_10px_rgba(59,130,246,0.4)] transition-all"
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
              onClick={async () => {
                await saveNow({ status: "complete" });
                navigate(`/export/${activeResumeId}`, { state: { builderData } });
              }}
              className="bg-primary text-surface rounded-md px-4 py-1.5 text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-ambient"
            >
              <FileText size={14} /> 
              Complete Rendering
            </button>
          </div>
        </div>

        <div 
          ref={previewContainerRef}
          className="flex-1 overflow-auto p-4 lg:p-10 flex justify-center custom-scrollbar relative"
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
              transformOrigin: "top center",
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
              scale={1} // Override default scale, since we zoom the parent container
            />
          </div>
          

        </div>
      </div>
    </div>
  );
}
