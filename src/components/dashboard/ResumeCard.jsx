import { FileText, Copy, Trash2, MoreHorizontal, LayoutTemplate, Download, Globe, EyeOff, Link as LinkIcon, Check, Mail, Pencil, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import ResumePreview from "../resume/ResumePreview";
import { useFirestore } from "../../hooks/useFirestore";
import { buildResumeTitleUpdate, normalizeResumeTitle } from "../../services/resumePersistence";
import { buildSharedResumeUrl, createShareToken } from "../../services/shareResume";

export default function ResumeCard({ resume, onDelete, onRename, onPublishChange }) {
  const navigate = useNavigate();
  const { updateResume } = useFirestore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const previewContainerRef = useRef(null);
  const [scale, setScale] = useState(0.38);
  const [copied, setCopied] = useState(false);
  const [draftTitle, setDraftTitle] = useState(() => normalizeResumeTitle(resume.title));
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [titleError, setTitleError] = useState(null);

  const handleTogglePublic = async (e) => {
    e.stopPropagation();
    const newStatus = !resume.isShared;
    const shareToken = resume.shareToken || createShareToken();
    const previousPublishState = {
      isShared: resume.isShared,
      shareToken: resume.shareToken,
    };

    onPublishChange?.(resume.id, {
      isShared: newStatus,
      shareToken,
    });
    setShowMenu(false);

    try {
      await updateResume(resume.id, {
        isShared: newStatus,
        shareToken,
      });
      
      if (newStatus) {
        const url = buildSharedResumeUrl(window.location.origin, shareToken);
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      onPublishChange?.(resume.id, previousPublishState);
      console.error("Failed to toggle public status", err);
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!previewContainerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setScale(width / 794);
      }
    });
    observer.observe(previewContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const displayTitle = normalizeResumeTitle(resume.title);

  const handleStartTitleEdit = (e) => {
    e.stopPropagation();
    setDraftTitle(displayTitle);
    setTitleError(null);
    setIsEditingTitle(true);
    setShowMenu(false);
  };

  const handleCancelTitleEdit = (e) => {
    e?.stopPropagation?.();
    setDraftTitle(displayTitle);
    setTitleError(null);
    setIsEditingTitle(false);
  };

  const handleSaveTitle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextTitle = normalizeResumeTitle(draftTitle);
    if (nextTitle === displayTitle) {
      setDraftTitle(nextTitle);
      setIsEditingTitle(false);
      return;
    }

    try {
      setIsSavingTitle(true);
      setTitleError(null);
      await updateResume(resume.id, buildResumeTitleUpdate(draftTitle));
      setDraftTitle(nextTitle);
      onRename?.(resume.id, nextTitle);
      setIsEditingTitle(false);
    } catch (error) {
      console.error("Failed to rename resume", error);
      setTitleError("Could not rename");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancelTitleEdit(e);
    }
  };

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
        ref={previewContainerRef}
        className="relative flex justify-center items-start overflow-visible transition-colors w-full"
        style={{ aspectRatio: "210/148", background: "rgba(7,13,31,0.5)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        onClick={() => navigate(`/builder/${resume.id}`)}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {resume.templateId && resume.resumeData ? (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none transition-transform duration-300 group-hover:scale-105">
              <div
                style={{ width: "794px", transform: `scale(${scale})`, transformOrigin: "top left" }}
                className="bg-white"
              >
                <ResumePreview resumeData={resume.resumeData} templateId={resume.templateId} isEditing={false} scale={1} />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {resume.templateId ? (
                <LayoutTemplate className="w-12 h-12 text-on-surface-variant/20" strokeWidth={1.5} />
              ) : (
                <FileText className="w-12 h-12 text-on-surface-variant/20" strokeWidth={1.5} />
              )}
            </div>
          )}

          {/* Subtle gradient overlay on preview */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, transparent 60%, rgba(7,13,31,0.3) 100%)" }} />
        </div>

        <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 max-w-[70%]">
          <div className={`status-pill ${statusColors[resume.status] || "bg-surface-container-highest"}`}>
            {resume.status}
          </div>

          {resume.isShared && (
            <div className="status-pill bg-[rgba(6,182,212,0.15)] text-primary border border-primary/20 flex items-center gap-1">
              <Globe size={10} /> Published
            </div>
          )}
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
                onClick={(e) => { e.stopPropagation(); navigate(`/cover-letter/${resume.id}`); setShowMenu(false); }}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors"
              >
                <Mail size={14} className="text-on-surface-variant" /> Write Cover Letter
              </button>

              <div className="h-px w-full my-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              <button
                onClick={handleTogglePublic}
                className="w-full text-left px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-[rgba(6,182,212,0.1)] flex items-center gap-2 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-400" /> : resume.isShared ? <EyeOff size={14} className="text-on-surface-variant" /> : <Globe size={14} className="text-primary" />}
                {copied ? <span className="text-green-400">Copied Link!</span> : resume.isShared ? "Unpublish Resume" : "Publish Resume"}
              </button>
              {resume.isShared && resume.shareToken && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const url = buildSharedResumeUrl(window.location.origin, resume.shareToken);
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => { setCopied(false); setShowMenu(false); }, 2000);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  <LinkIcon size={14} className="text-on-surface-variant" /> Copy Link
                </button>
              )}
              <div className="h-px w-full my-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
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
      <div className="px-4 py-4 flex flex-col" onClick={() => navigate(`/builder/${resume.id}`)}>
        {isEditingTitle ? (
          <form className="space-y-2" onSubmit={handleSaveTitle} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={draftTitle}
                disabled={isSavingTitle}
                aria-label="Resume title"
                onChange={(e) => setDraftTitle(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                className="min-w-0 flex-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[13px] font-semibold text-on-surface outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-70"
              />
              <button
                type="submit"
                aria-label="Save resume title"
                title="Save resume title"
                disabled={isSavingTitle}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary transition hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                aria-label="Cancel title edit"
                title="Cancel title edit"
                disabled={isSavingTitle}
                onClick={handleCancelTitleEdit}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-on-surface-variant transition hover:text-on-surface disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X size={14} />
              </button>
            </div>
            {titleError && (
              <p className="text-[11px] font-medium text-red-400">{titleError}</p>
            )}
          </form>
        ) : (
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 font-bold text-[15px] text-on-surface line-clamp-1 group-hover:text-primary transition-colors" title={displayTitle}>
              {displayTitle}
            </h3>
            <button
              type="button"
              aria-label="Rename resume title"
              title="Rename resume title"
              onClick={handleStartTitleEdit}
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
            >
              <Pencil size={13} />
            </button>
          </div>
        )}
        <p className="text-[13px] text-on-surface-variant mt-1 flex items-center gap-1.5 truncate">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/50"></span>
          {resume.targetRole || "No role specified"}
        </p>

        <div className="mt-4 pt-3 flex justify-between items-center" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[10px] text-on-surface-variant/70 font-semibold tracking-wider uppercase">
            Edited {dateStr}
          </span>
          <span className="text-primary text-[11px] font-bold tracking-wide flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0 -translate-x-2">
            EDIT <span className="text-[13px] leading-none">&rarr;</span>
          </span>
        </div>
      </div>
    </div>
  );
}
