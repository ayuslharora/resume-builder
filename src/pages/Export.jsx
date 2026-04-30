import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import ResumePreview from "../components/resume/ResumePreview";
import { Download, FileText, ArrowLeft } from "lucide-react";
import Spinner from "../components/ui/Spinner";

export default function Export() {
  const { resumeId } = useParams();
  const [resumeData, setResumeData] = useState(null);
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingType, setExportingType] = useState(null);
  const [savingFinal, setSavingFinal] = useState(false);
  const { getResume } = useFirestore();
  const resumeRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Helper: apply state from navigation (passed by EditStep)
    const stateBuilderData = location.state?.builderData;

    // Case 1: brand-new resume that was never saved (id="new")
    if (resumeId === "new" && stateBuilderData) {
      setResumeData(stateBuilderData.resumeData);
      setTemplateId(stateBuilderData.templateId);
      setLoading(false);
      return;
    }

    // Case 2: real Firestore id — try to fetch, fall back to nav state on any failure
    const hangTimeout = setTimeout(() => {
      // Timed out waiting for Firestore — use bundled state if present
      if (stateBuilderData) {
        setResumeData(stateBuilderData.resumeData);
        setTemplateId(stateBuilderData.templateId);
      }
      setLoading(false);
    }, 4000);

    getResume(resumeId).then(data => {
      clearTimeout(hangTimeout);
      if (data && data.resumeData) {
        setResumeData(data.resumeData);
        setTemplateId(data.templateId);
      } else if (stateBuilderData) {
        // Firestore returned empty doc — use bundled state
        setResumeData(stateBuilderData.resumeData);
        setTemplateId(stateBuilderData.templateId);
      }
      setLoading(false);
    }).catch((e) => {
      clearTimeout(hangTimeout);
      console.error("Firestore fetch failed, using local state:", e);
      // Firestore offline — use bundled state from EditStep
      if (stateBuilderData) {
        setResumeData(stateBuilderData.resumeData);
        setTemplateId(stateBuilderData.templateId);
      }
      setLoading(false);
    });
  }, [resumeId]);

  if (loading) return <Spinner />;
  if (!resumeData) return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
      <div className="glass-card ghost-border rounded-2xl p-10 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FileText size={28} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-3">No Resume Selected</h2>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          To download a resume, complete the builder flow and click <strong className="text-primary">"Export Resume"</strong> from the editor — or open an existing resume from your dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center justify-center gap-2 bg-primary text-surface px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-ambient"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center justify-center gap-2 text-on-surface-variant border border-surface-container-high px-6 py-3 rounded-xl font-medium hover:bg-surface-container transition"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );

  const handleDownloadPDF = async () => {
    try {
      setExportingType('pdf');
      const { exportPDF } = await import("../services/export");
      await exportPDF(resumeRef.current, `Resume_${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Export'}`);
    } catch (e) {
      alert("Failed to export PDF: " + e.message);
    } finally {
      setExportingType(null);
    }
  };

  const handleDownloadDOCX = async () => {
    try {
      setExportingType('docx');
      const { exportDOCX } = await import("../services/export");
      await exportDOCX(resumeData, `Resume_${resumeData.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Export'}`);
    } catch (e) {
      alert("Failed to export DOCX: " + e.message);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface/50 flex flex-col">
      {/* ── Sticky header bar ── */}
      <header className="glass-card shadow-sm border-b border-surface-container-high py-4 px-4 sm:px-6 sticky top-0 z-10 flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition font-medium">
          <ArrowLeft size={18} /> Back to Editor
        </button>
        <div className="flex gap-4 min-h-[40px] items-center">
            <>
              <button 
                 onClick={handleDownloadDOCX} 
                 disabled={exportingType}
                 className="flex items-center gap-2 bg-surface-lowest text-on-surface border border-surface-container-high px-4 py-2 rounded-lg font-medium hover:bg-surface-container transition disabled:opacity-50 fade-in"
              >
                <FileText size={18} /> {exportingType === 'docx' ? 'Exporting...' : 'DOCX'}
              </button>
              <button 
                 onClick={handleDownloadPDF} 
                 disabled={exportingType}
                 className="flex items-center gap-2 bg-primary text-surface px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 shadow-ambient fade-in"
              >
                <Download size={18} /> {exportingType === 'pdf' ? 'Exporting...' : 'PDF'}
              </button>
            </>
        </div>
      </header>

      {/* ── Resume preview ── */}
      <main className="flex-1 flex items-start justify-center p-6 sm:p-10">
        <div className="w-full max-w-[920px] overflow-x-auto custom-scrollbar border border-surface-container-high rounded-xl bg-surface-lowest p-4 sm:p-8 flex justify-center">
          <div
            ref={resumeRef}
            className="bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            style={{ width: '850px', flexShrink: 0 }}
          >
            <ResumePreview
              resumeData={resumeData}
              templateId={templateId}
              isEditing={false}
              scale={1}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
