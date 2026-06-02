import { X, AlertCircle, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function KeysExhaustedModal({ onClose }) {
  const navigate = useNavigate();

  function handleAddKey() {
    onClose();
    navigate("/profile#api-key");
  }

  return (
    <div className="app-design fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 panel overflow-hidden">
        <div
          className="px-6 py-5 border-b flex justify-between items-center"
          style={{ borderColor: "var(--border)", background: "var(--bg)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-md flex items-center justify-center"
              style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
            >
              <AlertCircle size={16} />
            </div>
            <div>
              <h3
                className="text-lg font-semibold tracking-tight"
                style={{ color: "var(--text)", lineHeight: 1.2 }}
              >
                AI servers are busy
              </h3>
              <p className="text-xs" style={{ color: "var(--muted)", marginTop: "2px" }}>
                All shared API keys are rate-limited
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md transition-colors hover:bg-surface-2"
            style={{ color: "var(--muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5" style={{ background: "var(--bg)" }}>
          <p className="text-sm mb-5" style={{ color: "var(--text)" }}>
            The shared Groq API keys are temporarily rate-limited. You can wait
            ~60 seconds and retry, or add your own free Groq API key to bypass
            this limit entirely.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAddKey}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{
                background: "var(--accent)",
                color: "#fff",
              }}
            >
              <Key size={15} />
              Add my own Groq API key
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
              style={{
                background: "var(--surface-2)",
                color: "var(--text)",
              }}
            >
              Got it, I'll wait
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
