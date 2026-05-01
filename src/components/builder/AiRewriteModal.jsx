import { useState, useEffect } from "react";
import { Wand2, Check, X, RefreshCw, AlertCircle } from "lucide-react";
import { rewriteResumeBullet } from "../../services/llm";

export default function AiRewriteModal({ data, context, onClose, onSelect }) {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRewrites() {
      try {
        setLoading(true);
        setError(null);
        const result = await rewriteResumeBullet(data.currentText, context);
        if (isMounted) {
          if (result && result.rewrites && result.rewrites.length > 0) {
            setOptions(result.rewrites);
          } else {
            setError("AI did not return any valid variations.");
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to generate rewrites. Please try again.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchRewrites();
    return () => { isMounted = false; };
  }, [data.currentText, context]);

  const handleApply = () => {
    if (selectedIdx !== null && options[selectedIdx]) {
      onSelect(options[selectedIdx].version);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      
      <div 
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        style={{ 
          background: "rgba(18,24,39,0.85)", 
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(6,182,212,0.1) inset"
        }}
      >
        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Wand2 size={16} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">AI Bullet Optimizer</h3>
              <p className="text-xs text-on-surface-variant">Select a variation to apply it to your resume</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-lg hover:bg-white/10 text-on-surface-variant hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Original</div>
            <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-sm text-gray-300 italic">
              "{data.currentText}"
            </div>
          </div>

          <div className="space-y-3 relative min-h-[150px]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="relative w-12 h-12 mb-4">
                  <div className="absolute inset-0 rounded-full" style={{ border: "2px solid rgba(6,182,212,0.15)" }} />
                  <div className="absolute inset-0 rounded-full animate-spin" style={{ border: "2px solid transparent", borderTopColor: "#06b6d4" }} />
                </div>
                <div className="text-sm font-medium text-primary animate-pulse">Generating high-impact variations...</div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="shrink-0 mt-0.5" size={16} />
                <span className="text-sm">{error}</span>
              </div>
            ) : (
              options.map((opt, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all duration-200 group ${
                    selectedIdx === idx 
                      ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 text-primary border border-primary/20 shrink-0">
                      {opt.focus || `Option ${idx + 1}`}
                    </div>
                    {selectedIdx === idx && (
                      <div className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className={`text-sm ${selectedIdx === idx ? "text-white" : "text-gray-300"}`}>
                    {opt.version}
                  </div>
                  {opt.whyItWorks && (
                    <div className="mt-3 text-xs text-on-surface-variant flex gap-2">
                      <span className="opacity-50">↳</span>
                      <span>{opt.whyItWorks}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex justify-between items-center">
          <div className="text-xs text-on-surface-variant/50">Powered by Llama 3</div>
          <div className="flex gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-sm font-medium text-on-surface hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply}
              disabled={loading || selectedIdx === null}
              className="px-5 py-2 text-sm font-bold bg-primary text-black rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Apply Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
