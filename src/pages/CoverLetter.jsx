import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import { generateCoverLetter } from "../services/llm";
import { ArrowLeft, Wand2, Download, FileText, Loader2, Home } from "lucide-react";
import Spinner from "../components/ui/Spinner";

export default function CoverLetter() {
  const { resumeId } = useParams();
  const { getResume } = useFirestore();
  const navigate = useNavigate();
  const hasResumeId = Boolean(resumeId && resumeId !== "new");
  
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(() => hasResumeId);
  
  const [jobDescription, setJobDescription] = useState("");
  const [coverLetterText, setCoverLetterText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const contentRef = useRef(null);

  useEffect(() => {
    if (!hasResumeId) {
      return;
    }
    getResume(resumeId)
      .then((data) => {
        if (data && data.resumeData) {
          setResumeData(data.resumeData);
        }
        setLoading(false);
      })
      .catch((e) => {
        console.error("Failed to load resume:", e);
        setLoading(false);
      });
  }, [getResume, hasResumeId, resumeId]);

  const handleGenerate = async () => {
    if (!resumeData) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateCoverLetter(resumeData, jobDescription);
      if (result && result.coverLetter) {
        setCoverLetterText(result.coverLetter);
      } else {
        throw new Error("Invalid response from AI");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate cover letter.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    // Ensure we capture the latest text before export if user hasn't blurred
    if (contentRef.current) {
      setCoverLetterText(contentRef.current.innerText);
    }
    
    if (!coverLetterText && !contentRef.current?.innerText) return;
    window.print();
  };

  if (loading) return <Spinner />;
  if (!resumeData) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
        <div className="glass-card ghost-border rounded-2xl p-10 max-w-md text-center">
          <h2 className="text-2xl font-bold text-on-surface mb-3">Resume Not Found</h2>
          <p className="text-on-surface-variant mb-8">Please select a valid resume from your dashboard to generate a cover letter.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full justify-center">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Basic styling mapping for the cover letter header
  const name = resumeData.personalInfo?.fullName || "Your Name";
  const email = resumeData.personalInfo?.email || "email@example.com";
  const phone = resumeData.personalInfo?.phone || "";
  const linkedin = resumeData.personalInfo?.linkedin || "";
  const location = resumeData.personalInfo?.location || "";

  const contactDetails = [email, phone, location, linkedin].filter(Boolean).join("  •  ");

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] bg-surface w-full overflow-hidden">
      
      {/* ── LEFT SIDEBAR ── */}
      <aside className="print-hide w-full lg:w-[400px] shrink-0 border-r border-white/5 bg-surface-lowest flex flex-col h-full z-20">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 text-on-surface-variant hover:text-primary transition-colors">
               <ArrowLeft size={18} />
             </button>
             <h2 className="font-bold text-on-surface text-lg">Cover Letter</h2>
          </div>
          <button onClick={() => navigate('/dashboard')} className="p-2 text-on-surface-variant hover:text-on-surface">
            <Home size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-on-surface block">
              1. Target Job Description
            </label>
            <p className="text-xs text-on-surface-variant">
              Paste the job description below. The AI will analyze your resume and this JD to write a highly tailored cover letter.
            </p>
            <textarea
              className="w-full bg-surface/50 border border-white/10 rounded-xl p-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 min-h-[200px] resize-y focus:outline-none focus:border-primary/50 transition-colors custom-scrollbar"
              placeholder="e.g. We are looking for a Senior Frontend Engineer with 5+ years of React experience..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-on-surface block">
              2. Generate Magic
            </label>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
              {isGenerating ? "Writing Cover Letter..." : "Generate Cover Letter"}
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          </div>

          {coverLetterText && (
            <div className="pt-6 border-t border-white/5 space-y-3 mt-auto">
               <label className="text-sm font-bold text-on-surface block">
                3. Export
              </label>
              <button
                onClick={handlePrintPDF}
                className="w-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border border-white/5"
              >
                <Download size={16} />
                Save as PDF
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── RIGHT PREVIEW AREA ── */}
      <main 
        className="print-resume-wrapper flex-1 overflow-y-auto overflow-x-auto custom-scrollbar p-6 sm:p-10 flex justify-center relative"
        style={{
          backgroundColor: "#0b1021",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      >
        {!coverLetterText && !isGenerating && (
           <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
             <FileText size={64} className="mb-4 text-on-surface-variant" />
             <p className="text-on-surface-variant text-sm font-medium tracking-wide">Your Cover Letter will appear here</p>
           </div>
        )}

        {(coverLetterText || isGenerating) && (
          <div 
            className="relative transition-all duration-300 transform"
            style={{ width: '816px', minHeight: '1056px', margin: '0 auto' }}
          >
             {/* A4 Paper Container */}
            <div
              className="print-resume-document bg-white w-full min-h-full shadow-[0_0_50px_rgba(0,0,0,0.5)] p-[1in] flex flex-col"
              style={{ boxSizing: 'border-box' }}
            >
              {/* Cover Letter Header */}
              <div className="border-b-2 border-gray-800 pb-4 mb-8 text-center">
                <h1 className="text-3xl font-serif text-gray-900 tracking-tight">{name}</h1>
                <p className="text-sm text-gray-600 mt-2 font-sans tracking-wide">{contactDetails}</p>
              </div>

              {/* Cover Letter Body Editable */}
              <div
                ref={contentRef}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={(e) => setCoverLetterText(e.target.innerText)}
                className="flex-1 w-full bg-transparent text-gray-800 font-serif text-[11pt] leading-relaxed focus:outline-none whitespace-pre-wrap break-words"
                style={{ minHeight: '600px', outline: 'none' }}
                spellCheck="false"
              >
                {coverLetterText}
              </div>
            </div>
            
            {/* Loading Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
                 <div className="bg-surface p-4 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/10">
                   <Loader2 size={24} className="text-primary animate-spin" />
                   <span className="text-on-surface font-bold text-sm tracking-wide">Drafting the perfect letter...</span>
                 </div>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
