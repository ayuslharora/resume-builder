import { useState } from "react";
import { Wand2, X, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { regenerateSection } from "../../services/llm";

export default function SectionAiRewriteModal({ sectionName, currentData, context, bragSheetText, onClose, onGenerated }) {
  const [instruction, setInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const newData = await regenerateSection(sectionName, currentData, context, bragSheetText, instruction);
      onGenerated(newData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to regenerate section. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app-design fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={!isGenerating ? onClose : undefined}
      />

      <div
        className="relative w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 panel"
      >
        <div className="px-6 py-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Wand2 size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)", lineHeight: 1.2 }}>Rewrite {sectionName}</h3>
              <p className="text-xs" style={{ color: "var(--muted)", marginTop: "2px" }}>Guide the AI on how to improve this entire section</p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md transition-colors text-muted hover:text-text hover:bg-surface-2"
              style={{ color: "var(--muted)" }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6" style={{ background: "var(--bg)" }}>
          {error && (
            <div className="mb-4 p-4 rounded-xl flex items-start gap-3 bg-bad-soft border border-bad/20 animate-in fade-in">
              <AlertCircle className="shrink-0 mt-0.5 text-bad" size={16} />
              <span className="text-[13.5px] text-bad">{error}</span>
            </div>
          )}

          <div className="py-2">
            <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>Instructions (Optional)</label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Focus more on my leadership roles, add more bullets from my brag sheet, or make it more concise..."
              className="w-full rounded-md p-3 text-[13.5px] outline-none resize-none transition-colors border-border-strong bg-surface-2 text-text"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
              rows={4}
              autoFocus
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={onClose} 
                className="btn btn-ghost btn-sm"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate} 
                className="btn btn-accent btn-sm min-w-[120px]"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Rewrite Section
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
