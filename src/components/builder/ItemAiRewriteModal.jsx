import { useState } from "react";
import { Wand2, X, AlertCircle, Sparkles, Loader2 } from "lucide-react";
import { regenerateItem } from "../../services/llm";

const SECTION_LABELS = {
  experience: "Experience Entry",
  projects: "Project",
  education: "Education Entry",
};

export default function ItemAiRewriteModal({ sectionName, itemIndex, currentItemData, context, bragSheetText, onClose, onGenerated }) {
  const [instruction, setInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const label = SECTION_LABELS[sectionName] || "Item";
  const itemTitle = currentItemData?.role || currentItemData?.name || currentItemData?.degree || label;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const newData = await regenerateItem(sectionName, currentItemData, context, bragSheetText, instruction);
      onGenerated(newData);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to rewrite. Please try again.");
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

      <div className="relative w-full max-w-lg overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 panel">
        <div className="px-6 py-5 border-b flex justify-between items-center" style={{ borderColor: "var(--border)", background: "var(--bg)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
              <Wand2 size={16} />
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--text)", lineHeight: 1.2 }}>
                Rewrite {label}
              </h3>
              <p className="text-xs truncate max-w-[260px]" style={{ color: "var(--muted)", marginTop: "2px" }}>
                {itemTitle}
              </p>
            </div>
          </div>
          {!isGenerating && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md transition-colors"
              style={{ color: "var(--muted)" }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="p-6" style={{ background: "var(--bg)" }}>
          {error && (
            <div className="mb-4 p-4 rounded-xl flex items-start gap-3 animate-in fade-in" style={{ background: "var(--bad-soft)", border: "1px solid rgba(185,28,28,0.18)" }}>
              <AlertCircle className="shrink-0 mt-0.5" size={16} style={{ color: "var(--bad)" }} />
              <span className="text-[13.5px]" style={{ color: "var(--bad)" }}>{error}</span>
            </div>
          )}

          <div className="py-2">
            <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>
              What would you like to improve? <span style={{ color: "var(--muted)", fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Make it sound more senior, focus on impact over tasks, add metrics..."
              className="w-full rounded-md p-3 text-[13.5px] outline-none resize-none transition-colors"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
              rows={3}
              autoFocus
              disabled={isGenerating}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
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

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="btn btn-ghost btn-sm" disabled={isGenerating}>
                Cancel
              </button>
              <button onClick={handleGenerate} className="btn btn-accent btn-sm min-w-[120px]" disabled={isGenerating}>
                {isGenerating ? (
                  <><Loader2 size={14} className="animate-spin" /> Rewriting...</>
                ) : (
                  <><Sparkles size={14} /> Rewrite</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
