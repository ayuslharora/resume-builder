import { useState } from "react";
import { parseDocument } from "../services/parser";
import { gradeResume } from "../services/gemini";
import { UploadCloud, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";

export default function Grader() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { text } = await parseDocument(file);
      if (!text.trim()) throw new Error("Document is empty.");
      const gradeData = await gradeResume(text);
      setResult(gradeData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: "rgba(6,182,212,0.08)",
            border: "1px solid rgba(6,182,212,0.2)",
            boxShadow: "0 0 24px rgba(6,182,212,0.15)"
          }}>
          <CheckCircle size={24} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-on-surface mb-3">Resume Grader</h1>
        <p className="text-on-surface-variant max-w-lg mx-auto">
          Upload your resume to get instant AI-powered feedback on content, ATS compatibility, and formatting.
        </p>
      </div>

      {/* Upload zone */}
      {!result && !loading && (
        <div
          className="h-64 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 group"
          style={{
            background: "rgba(25,31,49,0.4)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "2px dashed rgba(255,255,255,0.1)"
          }}
          onClick={() => document.getElementById("grader-upload").click()}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(6,182,212,0.4)";
            e.currentTarget.style.boxShadow = "0 0 32px rgba(6,182,212,0.08)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-transform duration-200 group-hover:scale-110"
            style={{ background: "rgba(25,31,49,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <UploadCloud size={28} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-on-surface mb-1">Select Resume Document</h3>
          <p className="text-sm text-on-surface-variant">Supports .pdf, .docx, .txt formats</p>
          <input id="grader-upload" type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="h-64 rounded-2xl flex flex-col items-center justify-center"
          style={{
            background: "rgba(25,31,49,0.4)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.06)"
          }}>
          <div className="relative w-12 h-12 mb-6">
            <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(6,182,212,0.15)" }} />
            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: "2px solid transparent", borderTopColor: "#06b6d4" }} />
          </div>
          <p className="text-sm font-semibold text-on-surface animate-pulse">Analyzing document patterns...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-5 rounded-xl flex flex-col items-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={24} className="text-red-400 mb-2" />
          <p className="text-sm font-medium text-red-400">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6 fade-in">
          {/* Score card */}
          <div className="p-8 md:p-12 rounded-xl flex flex-col items-center text-center"
            style={{
              background: "rgba(25,31,49,0.5)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)"
            }}>
            <div className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-6">
              Evaluation Score
            </div>
            <div className="relative w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center mb-6"
              style={{
                background: "rgba(7,13,31,0.6)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: result.score >= 80
                  ? "0 0 40px rgba(6,182,212,0.2)"
                  : result.score >= 50
                    ? "0 0 40px rgba(251,146,60,0.15)"
                    : "0 0 40px rgba(248,113,113,0.15)"
              }}>
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                <circle cx="50%" cy="50%" r="48%" fill="none" strokeWidth="4"
                  style={{ stroke: "rgba(255,255,255,0.06)" }} />
                <circle cx="50%" cy="50%" r="48%" fill="none" strokeWidth="4"
                  strokeDasharray="300"
                  strokeDashoffset={300 - (300 * result.score) / 100}
                  style={{
                    stroke: result.score >= 80 ? "#06b6d4" : result.score >= 50 ? "#fb923c" : "#f87171",
                    transition: "stroke-dashoffset 1.2s ease-out",
                    filter: `drop-shadow(0 0 6px ${result.score >= 80 ? "rgba(6,182,212,0.5)" : result.score >= 50 ? "rgba(251,146,60,0.4)" : "rgba(248,113,113,0.4)"})`
                  }}
                />
              </svg>
              <div className={`text-5xl font-black tracking-tight ${result.score >= 80 ? "text-primary" : result.score >= 50 ? "text-orange-400" : "text-red-400"}`}>
                {result.score}
              </div>
            </div>
            <p className="text-sm text-on-surface-variant max-w-sm">
              This score reflects how well your resume aligns with modern ATS parsing standards and recruiter preferences.
            </p>
          </div>

          {/* Feedback grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl"
              style={{
                background: "rgba(25,31,49,0.5)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}>
              <div className="flex items-center gap-2 mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <AlertCircle size={18} className="text-orange-400" />
                <h3 className="font-semibold text-on-surface">Areas for Improvement</h3>
              </div>
              <ul className="space-y-3">
                {(result.contentFeedback || []).map((fb, i) => (
                  <li key={i} className="flex gap-3 text-sm text-on-surface-variant items-start">
                    <span className="text-orange-400 mt-0.5 shrink-0">&middot;</span>
                    <span className="leading-relaxed">{fb}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl"
              style={{
                background: "rgba(25,31,49,0.5)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.06)"
              }}>
              <div className="flex items-center gap-2 mb-5 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <CheckCircle size={18} className="text-primary" />
                <h3 className="font-semibold text-on-surface">What's Working Well</h3>
              </div>
              <ul className="space-y-3">
                {(result.visualFeedback || []).map((fb, i) => (
                  <li key={i} className="flex gap-3 text-sm text-on-surface-variant items-start">
                    <span className="text-primary mt-0.5 shrink-0">&middot;</span>
                    <span className="leading-relaxed">{fb}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center mt-10">
            <button onClick={() => setResult(null)} className="btn-ghost">
              <RefreshCw size={16} /> Grade Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
