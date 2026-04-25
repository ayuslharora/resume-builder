import { useState, useRef } from "react";
import { useResume } from "../../context/ResumeContext";
import { parseDocument } from "../../services/parser";
import { UploadCloud, File, AlertCircle, X, ChevronRight, ChevronLeft } from "lucide-react";

export default function UploadStep() {
  const { nextStep, prevStep, setBragSheet, builderData } = useResume();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setLoading(true);
    try {
      const { text, fileName } = await parseDocument(file);
      if (!text.trim()) {
        throw new Error("The document appears to be empty or unreadable.");
      }
      setBragSheet(text, fileName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setBragSheet("", "");
  };

  const hasContent = builderData.bragSheetText && builderData.bragSheetText.length > 0;

  return (
    <div className="step-card fade-in">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-1">Upload Your Brag Sheet</h2>
        <p className="text-sm text-on-surface-variant">Drop in your existing resume, notes, or LinkedIn export (.txt, .docx, .pdf) — we'll extract the good stuff.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!hasContent ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="h-56 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
          style={{
            background: "rgba(25,31,49,0.4)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "2px dashed rgba(255,255,255,0.1)"
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(6,182,212,0.35)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          {loading ? (
            <div className="flex flex-col items-center">
              <div className="relative w-8 h-8 mb-4">
                <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(6,182,212,0.15)" }} />
                <div className="absolute inset-0 rounded-full animate-spin" style={{ border: "2px solid transparent", borderTopColor: "#06b6d4" }} />
              </div>
              <p className="text-on-surface-variant text-sm font-medium">Parsing file...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                style={{ background: "rgba(25,31,49,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <UploadCloud className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
              </div>
              <p className="font-semibold text-on-surface mb-1">Click to browse files</p>
              <p className="text-on-surface-variant text-xs">Supports .txt, .docx, .pdf</p>
            </>
          )}
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.docx,.pdf" className="hidden" />
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden"
          style={{ background: "rgba(7,13,31,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-4 py-3 flex justify-between items-center"
            style={{ background: "rgba(25,31,49,0.5)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5 text-sm font-semibold text-on-surface">
              <File size={16} className="text-primary" /> {builderData.bragSheetFileName}
            </div>
            <button onClick={handleClear} className="text-on-surface-variant hover:text-red-400 p-1 transition-colors rounded-md hover:bg-surface-lowest">
              <X size={16} />
            </button>
          </div>
          <div className="p-4">
            <div className="h-40 overflow-y-auto w-full text-xs text-on-surface-variant font-mono whitespace-pre-wrap custom-scrollbar">
              {builderData.bragSheetText}
            </div>
            <div className="mt-3 pt-3 border-t border-surface-container-high flex justify-between items-center">
              <div className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                Successfully Extracted
              </div>
              <div className="text-xs font-mono text-primary/80">
                {builderData.bragSheetText.length.toLocaleString()} chars
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-5 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={prevStep} className="btn-ghost" disabled={loading}>
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={nextStep}
          disabled={loading || !hasContent}
          className="btn-primary"
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
