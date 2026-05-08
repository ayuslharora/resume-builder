import { useState, useRef } from "react";
import { useResume } from "../../context/useResume";
import { parseDocument } from "../../services/parser";
import { UploadCloud, File, AlertCircle, X, ChevronRight, ChevronLeft, Type } from "lucide-react";

export default function UploadStep() {
  const { nextStep, prevStep, setBragSheet, builderData, saveNow } = useResume();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [pastedText, setPastedText] = useState("");
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

  const handlePasteSubmit = () => {
    if (!pastedText.trim()) {
      setError("Please enter some text before proceeding.");
      return;
    }
    setError(null);
    setBragSheet(pastedText, "Pasted Text");
  };

  const handleClear = () => {
    setBragSheet("", "");
    setPastedText("");
  };

  const hasContent = builderData.bragSheetText && builderData.bragSheetText.length > 0;
  const tabStyle = (isActive) => (
    isActive
      ? {
        background: "var(--accent-soft)",
        boxShadow: "inset 0 0 0 1px var(--builder-form-accent-border)"
      }
      : undefined
  );

  const handleNext = async () => {
    await saveNow({
      bragSheetText: builderData.bragSheetText,
      bragSheetFileName: builderData.bragSheetFileName,
      status: "draft",
    });
    nextStep();
  };

  return (
    <div className="step-card fade-in">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-1">Upload Your Brag Sheet</h2>
        <p className="text-sm text-on-surface-variant">Drop in your existing resume, notes, or LinkedIn export (.txt, .docx, .pdf), or paste it directly.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={16} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {!hasContent ? (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap p-1 rounded-lg mx-auto w-full sm:w-fit" style={{ background: "var(--builder-form-surface-muted)", border: "1px solid var(--builder-form-border-soft)" }}>
            <button
              className={`builder-upload-tab flex flex-1 items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 sm:flex-none ${activeTab === "upload" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              style={tabStyle(activeTab === "upload")}
              onClick={() => { setActiveTab("upload"); setError(null); }}
            >
              <UploadCloud size={16} /> Upload File
            </button>
            <button
              className={`builder-upload-tab flex flex-1 items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 sm:flex-none ${activeTab === "text" ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
              style={tabStyle(activeTab === "text")}
              onClick={() => { setActiveTab("text"); setError(null); }}
            >
              <Type size={16} /> Paste Text
            </button>
          </div>

          {activeTab === "upload" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-48 sm:h-56 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
              style={{
                background: "var(--builder-form-surface)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "2px dashed var(--builder-form-border)"
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--builder-form-border)"; }}
            >
              {loading ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-8 h-8 mb-4">
                    <div className="absolute inset-0 rounded-full" style={{ border: "2px solid var(--builder-form-accent-border)" }} />
                    <div className="absolute inset-0 rounded-full animate-spin" style={{ border: "2px solid transparent", borderTopColor: "var(--accent)" }} />
                  </div>
                  <p className="text-on-surface-variant text-sm font-medium">Parsing file...</p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ background: "var(--accent-soft)", border: "1px solid var(--builder-form-accent-border)" }}>
                    <UploadCloud className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
                  </div>
                  <p className="font-semibold text-on-surface mb-1">Click to browse files</p>
                  <p className="text-on-surface-variant text-xs">Supports .txt, .docx, .pdf</p>
                </>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.docx,.pdf" className="hidden" />
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="relative">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  maxLength={5000}
                  placeholder="Paste your resume, notes, or achievements here..."
                  className="w-full h-56 p-4 rounded-xl resize-none outline-none custom-scrollbar transition-all duration-200"
                  style={{
                    background: "var(--builder-form-surface)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--builder-form-border)",
                    color: "var(--builder-form-text)",
                  }}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "var(--accent)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px var(--builder-form-focus-ring)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = "var(--builder-form-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                <div className="absolute bottom-3 right-4 text-xs text-on-surface-variant font-mono">
                  {pastedText.length} / 5,000
                </div>
              </div>
              <button
                onClick={handlePasteSubmit}
                className="btn-primary w-full sm:w-auto self-stretch sm:self-end"
                disabled={!pastedText.trim()}
              >
                Extract Info
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300"
          style={{ background: "var(--builder-form-surface)", border: "1px solid var(--builder-form-border-soft)" }}>
          <div className="px-4 py-3 flex justify-between items-center"
            style={{ background: "var(--builder-form-surface-muted)", borderBottom: "1px solid var(--builder-form-border-soft)" }}>
            <div className="flex items-center gap-2.5 text-sm font-semibold text-on-surface">
              <File size={16} className="text-primary" /> {builderData.bragSheetFileName}
            </div>
            <button onClick={handleClear} className="builder-upload-clear text-on-surface-variant hover:text-red-500 p-1 transition-colors rounded-md">
              <X size={16} />
            </button>
          </div>
          <div className="p-4">
            <div className="h-40 overflow-y-auto w-full text-xs text-on-surface-variant font-mono whitespace-pre-wrap custom-scrollbar">
              {builderData.bragSheetText}
            </div>
            <div className="mt-3 pt-3 flex justify-between items-center" style={{ borderTop: "1px solid var(--builder-form-border-soft)" }}>
              <div className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">
                Successfully Extracted
              </div>
              <div className="builder-upload-count text-xs font-mono">
                {builderData.bragSheetText.length.toLocaleString()} chars
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 pt-5 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center" style={{ borderTop: "1px solid var(--builder-form-border-soft)" }}>
        <button onClick={prevStep} className="btn-ghost w-full sm:w-auto" disabled={loading}>
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={handleNext}
          disabled={loading || !hasContent}
          className="btn-primary w-full sm:w-auto"
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
