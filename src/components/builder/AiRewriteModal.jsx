import { useState } from "react";
import { Wand2, Check, X, AlertCircle, Sparkles } from "lucide-react";
import { rewriteResumeBullet } from "../../services/llm";

export default function AiRewriteModal({ data, context, onClose, onSelect }) {
  const [step, setStep] = useState("prompt"); // "prompt" | "loading" | "results" | "error"
  const [customInstruction, setCustomInstruction] = useState("");
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  const fetchRewrites = async (instruction = "") => {
    try {
      setStep("loading");
      setError(null);
      const result = await rewriteResumeBullet(data.currentText, { ...context, customInstruction: instruction });
      if (result && result.rewrites && result.rewrites.length > 0) {
        setOptions(result.rewrites);
        setStep("results");
      } else {
        setError("AI did not return any valid variations.");
        setStep("error");
      }
    } catch (err) {
      setError(err.message || "Failed to generate rewrites. Please try again.");
      setStep("error");
    }
  };

  const handleGenerate = () => {
    fetchRewrites(customInstruction);
  };

  const handleApply = () => {
    if (selectedIdx !== null && options[selectedIdx]) {
      onSelect(options[selectedIdx].version);
    }
  };

  return (
    <div className="app-design fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 panel"
      >
        <div className="px-6 py-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Wand2 size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)", lineHeight: 1.2 }}>AI Bullet Optimizer</h3>
              <p className="text-xs" style={{ color: "var(--muted)", marginTop: "2px" }}>Select a variation to apply it to your resume</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: "var(--muted)" }}
            onMouseOver={(e) => { e.currentTarget.style.color = "var(--text)"; e.currentTarget.style.background = "var(--surface-2)"; }}
            onMouseOut={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "transparent"; }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar" style={{ background: "var(--bg)" }}>
          <div className="mb-6">
            <div className="lbl-mono mb-2">Original</div>
            <div className="p-3 rounded-md text-[13.5px] italic" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
              "{data.currentText}"
            </div>
          </div>

          <div className="space-y-3 relative min-h-[150px]">
            {step === "prompt" ? (
              <div className="py-2 animate-in fade-in">
                <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>What would you like to change?</label>
                <textarea
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder="e.g. Make it sound more leadership-focused, or keep it under 10 words..."
                  className="w-full rounded-md p-3 text-[13.5px] outline-none resize-none transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
                  rows={3}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--accent)";
                    e.target.style.boxShadow = "0 0 0 2px var(--accent-soft)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border-strong)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={() => fetchRewrites("")} className="btn btn-outline btn-sm">
                    Auto-improve
                  </button>
                  <button onClick={handleGenerate} className="btn btn-accent btn-sm">
                    <Sparkles size={14} />
                    Generate
                  </button>
                </div>
              </div>
            ) : step === "loading" ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center animate-in fade-in">
                <div className="relative w-12 h-12 mb-4">
                  <div className="absolute inset-0 rounded-full" style={{ border: "2px solid var(--border-strong)" }} />
                  <div className="absolute inset-0 rounded-full animate-spin" style={{ border: "2px solid transparent", borderTopColor: "var(--accent)" }} />
                </div>
                <div className="text-sm font-medium animate-pulse" style={{ color: "var(--accent)" }}>Generating high-impact variations...</div>
              </div>
            ) : step === "error" ? (
              <div className="p-4 rounded-xl flex items-start gap-3 animate-in fade-in" style={{ background: "var(--bad-soft)", border: "1px solid rgba(185,28,28,0.18)" }}>
                <AlertCircle className="shrink-0 mt-0.5" size={16} style={{ color: "var(--bad)" }} />
                <div className="flex-1">
                  <span className="block text-[13.5px] leading-relaxed mb-2" style={{ color: "var(--bad)" }}>{error}</span>
                  <button onClick={() => setStep("prompt")} className="btn btn-outline btn-sm">Try Again</button>
                </div>
              </div>
            ) : (
              options.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group animate-in slide-in-from-bottom-2 fade-in`}
                  style={{
                    background: selectedIdx === idx ? "var(--surface)" : "var(--bg)",
                    borderColor: selectedIdx === idx ? "var(--accent)" : "var(--border)",
                    boxShadow: selectedIdx === idx ? "0 0 0 1px var(--accent)" : "none",
                    animationDelay: `${idx * 50}ms`,
                  }}
                >
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="text-xs font-bold px-2 py-0.5 rounded-md shrink-0" style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border-strong)" }}>
                      {opt.focus || `Option ${idx + 1}`}
                    </div>
                    {selectedIdx === idx && (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--accent)", color: "var(--accent-fg)" }}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="text-[13.5px] leading-relaxed" style={{ color: selectedIdx === idx ? "var(--text)" : "var(--text-2)" }}>
                    {opt.version}
                  </div>
                  {opt.whyItWorks && (
                    <div className="mt-3 text-xs flex gap-2" style={{ color: "var(--muted)" }}>
                      <span className="opacity-50">↳</span>
                      <span>{opt.whyItWorks}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t flex justify-between items-center" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <div className="text-xs" style={{ color: "var(--muted)" }}>Powered by Llama 3</div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={step !== "results" || selectedIdx === null}
              className="btn btn-accent btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
