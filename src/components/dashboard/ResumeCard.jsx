import { FileText, Copy, Trash2, MoreHorizontal, LayoutTemplate, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ResumePreview from "../resume/ResumePreview";

export default function ResumeCard({ resume, onDelete, onDuplicate }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateStr = resume.updatedAt?.seconds
    ? new Date(resume.updatedAt.seconds * 1000).toLocaleDateString()
    : "Just now";

  const statusColors = {
    draft: "bg-white/5 text-on-surface-variant border border-white/10",
    generated: "bg-primary/10 text-primary border border-primary/20",
    complete: "bg-green-500/10 text-green-400 border border-green-500/20"
  };

  return (
    <div
      className="group relative flex flex-col cursor-pointer overflow-hidden rounded-xl transition-all duration-200"
      style={{
        background: "rgba(25,31,49,0.5)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "rgba(6,182,212,0.2)";
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(6,182,212,0.12)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Preview area */}
      <div
        className="h-48 relative flex justify-center items-center overflow-hidden transition-colors"
        style={{ background: "rgba(7,13,31,0.5)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        onClick={() => navigate(`/builder/${resume.id}`)}
      >
        {resume.templateId && resume.resumeData ? (
          <div className="absolute top-9 left-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-300 group-hover:-translate-y-2 z-0">
            <div 
              style={{ width: "794px", transform: "scale(0.26)", transformOrigin: "top center" }}
              className="bg-white overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.4)] border border-black/10"
            >
              <ResumePreview resumeData={resume.resumeData} templateId={resume.templateId} isEditing={false} scale={1} />
            </div>
          </div>
        ) : resume.templateId ? (
          <LayoutTemplate className="w-12 h-12 text-on-surface-variant/20" strokeWidth={1.5} />
        ) : (
          <FileText className="w-12 h-12 text-on-surface-variant/20" strokeWidth={1.5} />
        )}

        {/* Subtle gradient overlay on preview */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(7,13,31,0.3) 100%)" }} />

        <div className={`absolute top-3 left-3 z-10 status-pill ${statusColors[resume.status] || "bg-surface-container-highest"}`}>
          {resume.status}
        </div>

        <div className="absolute top-3 right-3 z-10" ref={menuRef}>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1.5 rounded-md text-on-surface-variant hover:text-on-surface transition-colors"
            style={{
              background: "rgba(10,15,30,0.8)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-36 rounded-lg shadow-xl z-20 py-1"
              style={{
                background: "rgba(10,15,30,0.92)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
              }}>
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/export/${resume.id}`); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Download size={14} className="text-on-surface-variant" /> Download
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Copy size={14} className="text-on-surface-variant" /> Duplicate
              </button>
              <div className="h-px w-full my-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const ok = window.confirm("Are you sure you want to delete this resume?");
                  if (ok) onDelete();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="px-5 py-5 flex flex-col" onClick={() => navigate(`/builder/${resume.id}`)}>
        <h3 className="font-bold text-lg text-on-surface line-clamp-1 group-hover:text-primary transition-colors" title={resume.title}>
          {resume.title}
        </h3>
        <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-2 truncate">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50"></span>
          {resume.targetRole || "No role specified"}
        </p>

        <div className="mt-5 pt-4 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[11px] text-on-surface-variant/70 font-semibold tracking-wider uppercase">
            Edited {dateStr}
          </span>
          <span className="text-primary text-xs font-bold tracking-wide flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2">
            EDIT <span className="text-lg leading-none">&rarr;</span>
          </span>
        </div>
      </div>
    </div>
  );
}
