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
    draft: "bg-surface-container-highest text-on-surface-variant",
    generated: "bg-primary/10 text-primary",
    complete: "bg-green-500/10 text-green-400"
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
        className="h-44 relative flex justify-center items-center overflow-hidden transition-colors"
        style={{ background: "rgba(7,13,31,0.5)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        onClick={() => navigate(`/builder/${resume.id}`)}
      >
        {resume.templateId && resume.resumeData ? (
          <div className="absolute top-4 left-1/2 transition-transform duration-300 group-hover:scale-105 pointer-events-none"
            style={{ width: "794px", transform: "translateX(-50%) scale(0.35)", transformOrigin: "top center" }}>
            <ResumePreview resumeData={resume.resumeData} templateId={resume.templateId} isEditing={false} />
          </div>
        ) : resume.templateId ? (
          <LayoutTemplate className="w-12 h-12 text-on-surface-variant/20" strokeWidth={1.5} />
        ) : (
          <FileText className="w-12 h-12 text-on-surface-variant/20" strokeWidth={1.5} />
        )}

        {/* Subtle gradient overlay on preview */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(7,13,31,0.3) 100%)" }} />

        <div className={`absolute top-3 left-3 status-pill ${statusColors[resume.status] || "bg-surface-container-highest"}`}>
          {resume.status}
        </div>

        <div className="absolute top-3 right-3" ref={menuRef}>
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
      <div className="p-4" onClick={() => navigate(`/builder/${resume.id}`)}>
        <h3 className="font-semibold text-sm text-on-surface truncate" title={resume.title}>{resume.title}</h3>
        <p className="text-xs text-on-surface-variant mt-1.5 truncate">
          {resume.targetRole || "No role specified"}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="text-[10px] text-on-surface-variant font-medium">Edited {dateStr}</span>
          <span className="text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Edit &rarr;
          </span>
        </div>
      </div>
    </div>
  );
}
