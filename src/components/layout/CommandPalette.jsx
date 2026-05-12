import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { useFirestore } from "../../hooks/useFirestore";
import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";

const NAV_ACTIONS = [
  { id: "new", label: "New resume", icon: Plus, path: "/builder/new", group: "Actions" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", group: "Actions" },
  { id: "grader", label: "Resume Grader", icon: CheckSquare, path: "/grader", group: "Actions" },
  { id: "resources", label: "Resources", icon: BookOpen, path: "/resources", group: "Actions" },
  { id: "help", label: "Help & docs", icon: HelpCircle, path: "/help", group: "Actions" },
  { id: "whats-new", label: "What's new", icon: Sparkles, path: "/whats-new", group: "Actions" },
];

export function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [resumes, setResumes] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getUserResumes } = useFirestore();

  useEffect(() => {
    if (!isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery("");
      setSelectedIdx(0);
      return;
    }
    setTimeout(() => inputRef.current?.focus(), 0);
    if (currentUser) {
      getUserResumes(currentUser.uid).then(setResumes).catch(() => {});
    }
  }, [isOpen, currentUser, getUserResumes]);

  const resumeItems = resumes.slice(0, 6).map((r) => ({
    id: r.id,
    label: r.title || "Untitled Resume",
    icon: FileText,
    path: `/builder/${r.id}`,
    group: "Recent resumes",
  }));

  const allItems = [...NAV_ACTIONS, ...resumeItems];

  const filtered = query.trim()
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setSelectedIdx(0); }, [query]);

  const go = useCallback(
    (item) => {
      navigate(item.path);
      onClose();
    },
    [navigate, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && filtered[selectedIdx]) {
        go(filtered[selectedIdx]);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIdx, go, onClose]);

  if (!isOpen) return null;

  // Build grouped list with flat indices for keyboard selection
  const groups = [];
  const groupMap = {};
  let flatIdx = 0;
  for (const item of filtered) {
    if (!groupMap[item.group]) {
      groupMap[item.group] = { name: item.group, items: [] };
      groups.push(groupMap[item.group]);
    }
    groupMap[item.group].items.push({ ...item, flatIdx: flatIdx++ });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[14vh] p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="panel relative w-full max-w-lg overflow-hidden"
        style={{
          boxShadow: "var(--shadow-lg)",
          animation: "cp-in 0.14s ease-out forwards",
        }}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-3">
          <Search size={15} className="shrink-0 text-[var(--muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages and resumes…"
            className="flex-1 bg-transparent text-[14px] text-[var(--text)] placeholder:text-[var(--faint)] outline-none"
          />
          <kbd className="mono flex h-5 items-center rounded border border-[var(--border-strong)] bg-[var(--surface-2)] px-1.5 text-[10px] text-[var(--muted)]">
            Esc
          </kbd>
        </div>

        <div className="max-h-[360px] overflow-y-auto p-1.5 pb-2">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-[13px] text-[var(--muted)]">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {groups.map((group) => (
            <div key={group.name}>
              <div className="lbl-mono px-3 pb-1.5 pt-3">{group.name}</div>
              {group.items.map((item) => {
                const isSelected = item.flatIdx === selectedIdx;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => go(item)}
                    onMouseEnter={() => setSelectedIdx(item.flatIdx)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? "bg-[var(--surface-2)]"
                        : "hover:bg-[var(--surface)]"
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
                      <Icon size={13} className="text-[var(--muted)]" />
                    </span>
                    <span className="flex-1 text-[13.5px] text-[var(--text)]">
                      {item.label}
                    </span>
                    {isSelected && (
                      <ArrowRight size={13} className="text-[var(--muted)]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes cp-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  );
}
