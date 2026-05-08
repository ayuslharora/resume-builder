import { X, Command } from "lucide-react";
import { useEffect } from "react";

const SHORTCUTS = [
  {
    category: "General",
    items: [
      { keys: ["⌘", "K"], description: "Open command palette" },
      { keys: ["⌘", "F"], description: "Search / command palette" },
    ]
  },
  {
    category: "Editor",
    items: [
      { keys: ["⌘", "S"], description: "Save draft" },
      { keys: ["⌘", "P"], description: "Preview / Export PDF" },
      { keys: ["⌘", "/"], description: "Toggle ATS panel" },
      { keys: ["⌘", "Z"], description: "Undo last change" },
    ]
  },
  {
    category: "AI Grader",
    items: [
      { keys: ["⌘", "G"], description: "Run ATS grader" },
      { keys: ["⌘", "R"], description: "Rewrite active bullet" },
    ]
  }
];

export function ShortcutsModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="panel relative w-full max-w-md overflow-hidden rounded-2xl p-0 shadow-2xl"
        style={{ 
          background: "var(--bg)", 
          border: "1px solid var(--border)",
          animation: "fade-in-up 0.2s ease-out forwards"
        }}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4 px-5">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <Command size={18} className="text-[var(--accent)]" />
            <h2 className="font-semibold text-lg m-0 leading-none tracking-tight">Keyboard Shortcuts</h2>
          </div>
          <button 
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 pb-4">
          {SHORTCUTS.map((section, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <div className="px-4 pb-2 pt-4 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                {section.category}
              </div>
              <div className="flex flex-col gap-0.5 px-2">
                {section.items.map((item, j) => (
                  <div key={j} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[var(--surface)] transition-colors">
                    <span className="text-[13px] font-medium text-[var(--text-2)]">{item.description}</span>
                    <div className="flex items-center gap-1.5">
                      {item.keys.map((k, idx) => (
                        <kbd 
                          key={idx}
                          className="flex h-6 min-w-[24px] items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--surface-2)] px-1.5 text-[11.5px] font-medium text-[var(--text)] shadow-sm font-mono"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
