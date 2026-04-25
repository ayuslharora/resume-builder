import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useResume } from "../../context/ResumeContext";
import ResumePreview from "../resume/ResumePreview";
import { regenerateSection } from "../../services/gemini";
import { Wand2, Download, Save, Loader2, FileText } from "lucide-react";

export default function EditStep() {
  const { builderData, updateSection, saveNow, activeResumeId } = useResume();
  const [activeSection, setActiveSection] = useState("personalInfo");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localData, setLocalData] = useState(null);
  const navigate = useNavigate();

  const { resumeData, templateId, interviewAnswers, isSaving } = builderData;

  const currentSectionData = resumeData?.[activeSection];

  // Sync local typing state to avoid blocking the UI thread on keystrokes
  useEffect(() => {
    setLocalData(currentSectionData);
  }, [currentSectionData, activeSection]);

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

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const newData = await regenerateSection(activeSection, currentSectionData, interviewAnswers);
      updateSection(activeSection, newData);
    } catch (err) {
      alert("Failed to regenerate: " + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleChange = (field, value) => {
    const newData =
      typeof localData === "object" && localData !== null
        ? { ...localData, [field]: value }
        : value;
    setLocalData(newData);
    if (window.editTimeout) clearTimeout(window.editTimeout);
    window.editTimeout = setTimeout(() => {
      updateSection(activeSection, newData);
    }, 400);
  };



  const renderEditor = () => {
    if (activeSection === "summary") {
      return (
        <div className="fade-in space-y-4 pt-4">
          <div>
            <label className="label-md block pl-1 mb-2">Executive Summary</label>
            <textarea
              rows="6"
              className="custom-scrollbar"
              value={localData !== null ? localData : ""}
              onChange={(e) => handleChange("summary", e.target.value)}
            />
          </div>
        </div>
      );
    }

    if (activeSection === "personalInfo") {
      const safeData = currentSectionData || { fullName: "", email: "", phone: "", location: "" };
      return (
        <div className="fade-in grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          {Object.keys(safeData).map((key) => (
            <div key={key}>
              <label className="label-md block pl-2 mb-2 capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              <input
                type="text"
                value={localData?.[key] || ""}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="fade-in p-5 bg-primary/5 rounded-xl border border-primary/20 mt-4">
        <p className="font-bold text-primary mb-2">AI Regeneration Available</p>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Manual editing of list-based sections isn't supported here. Use the{" "}
          <strong>AI Regenerate</strong> button (✦) above to rewrite this section automatically.
        </p>
      </div>
    );
  };

  const SectionTabs = ["personalInfo", "summary", "experience", "education", "projects", "skills"];

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full lg:h-[calc(100vh-140px)]">
      {/* ── Left panel: section editors + download buttons ── */}
      <div className="w-full lg:w-[450px] flex flex-col lg:h-full">
        <div className="mb-5">
          <h2 className="text-xs font-bold tracking-widest text-primary uppercase mb-1">
            Project Workspace
          </h2>
          <h1 className="text-2xl font-bold text-on-surface">
            Executive Portfolio / {new Date().getFullYear()}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
          {SectionTabs.map((section) => (
            <div
              key={section}
              className={`glass-card ghost-border rounded-xl transition-all overflow-hidden border ${
                activeSection === section
                  ? "border-primary ring-1 ring-primary/50 shadow-ambient bg-surface-lowest"
                  : "border-surface-container-high bg-surface-container/50 hover:border-primary/50"
              }`}
            >
              <div
                className="p-4 flex justify-between items-center cursor-pointer"
                onClick={() => setActiveSection(section)}
              >
                <div>
                  <h3
                    className={`font-bold capitalize transition-colors ${
                      activeSection === section ? "text-primary" : "text-on-surface"
                    }`}
                  >
                    {section === "personalInfo"
                      ? "Personal Info"
                      : section === "experience"
                      ? "Experience"
                      : section === "skills"
                      ? "Skills"
                      : section.replace(/([A-Z])/g, " $1").trim()}
                  </h3>
                </div>
                {activeSection === section && section !== "personalInfo" && (
                  <button
                    disabled={isRegenerating}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRegenerate();
                    }}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded-md transition disabled:opacity-50"
                    title="AI Regenerate Section"
                  >
                    <Wand2 size={16} className={isRegenerating ? "animate-pulse" : ""} />
                  </button>
                )}
              </div>
              {activeSection === section && (
                <div className="px-4 pb-5 border-t border-surface-container-high/50 bg-black/10">
                  {renderEditor()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Export button ── */}
        <div className="pt-6 mt-4">
          {isSaving && (
            <p className="text-xs text-primary/60 font-mono flex items-center gap-1.5 justify-center mb-3">
              <Loader2 size={11} className="animate-spin" /> Saving to cloud...
            </p>
          )}
          <button 
            onClick={async () => {
              // Explicitly push a final save to Firebase marking the resume as complete
              await saveNow({ status: "complete" });
              navigate(`/export/${activeResumeId}`, { state: { builderData } });
            }}
            className="w-full bg-primary text-surface rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition shadow-ambient relative group"
          >
            <div className="absolute inset-0 border border-primary border-dashed rounded-xl transform translate-x-1 translate-y-1 transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5"></div>
            <FileText size={18} className="relative" /> 
            <span className="relative">Complete Rendering</span>
          </button>
        </div>
      </div>

      {/* ── Right panel: live preview ref'd for PDF/html2canvas capture ── */}
      <div className="flex-1 glass-card ghost-border rounded-2xl flex flex-col overflow-hidden relative min-h-[60vh] lg:min-h-0">
        <div className="bg-surface-lowest border-b ghost-border border-x-0 border-t-0 p-3 px-5 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              Real-Time Render
            </span>
          </div>
          <div className="text-[10px] font-mono text-primary/70">
            <Save size={12} className="inline mr-1" />
            SYNCED TO CLOUD
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#1a1a24] p-4 lg:p-8 flex justify-center custom-scrollbar">
          <div className="bg-white shadow-[0_0_30px_rgba(0,0,0,0.4)]" style={{ width: "794px" }}>
            <ResumePreview
              resumeData={resumeData}
              templateId={templateId}
              isEditing={true}
              activeSection={activeSection}
              onSectionClick={setActiveSection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
