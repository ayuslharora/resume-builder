import { FileText, Trash2, MoreHorizontal, LayoutTemplate, Download, Globe, EyeOff, Link as LinkIcon, Check, Mail, Pencil, X } from "lucide-react";
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
        setScale(Math.max((width - 36) / 794, 0.1));
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
    draft: "pill-warn",
    generated: "pill-accent",
    complete: "pill-good"
  };
  const statusLabel = {
    draft: "Draft",
    generated: "Generated",
    complete: "Complete"
  }[resume.status] || "Draft";

  return (
    <div
      className="panel lift group relative cursor-pointer overflow-visible"
      style={{ padding: 0 }}
    >
      {/* Preview area */}
      <div
        ref={previewContainerRef}
        style={{ aspectRatio: "1.7", padding: "14px 14px 0", background: "var(--surface)", borderBottom: "1px solid var(--border)", overflow: "hidden", position: "relative", borderRadius: "12px 12px 0 0" }}
        onClick={() => navigate(`/builder/${resume.id}`)}
      >
        <div
          style={{ background: "white", width: "100%", aspectRatio: "0.78", borderRadius: "4px 4px 0 0", padding: "16px 18px 0", color: "#1a1a1a", boxShadow: "0 1px 2px rgba(0,0,0,.04)", overflow: "hidden" }}
        >
          {resume.templateId && resume.resumeData ? (
            <div
              className="pointer-events-none transition-transform duration-300 group-hover:scale-[1.025]"
              style={{ width: "794px", transform: `scale(${scale})`, transformOrigin: "top left" }}
            >
              <ResumePreview resumeData={resume.resumeData} templateId={resume.templateId} isEditing={false} scale={1} />
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
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 12, background: "linear-gradient(to bottom, transparent, color-mix(in oklch, var(--surface) 70%, transparent))", pointerEvents: "none" }} />

        {resume.isShared && (
          <span className="pill pill-accent" style={{ position: "absolute", top: 22, left: 22 }}>
            <Globe size={11} /> Published
          </span>
        )}
      </div>

      <div style={{ position: "absolute", top: 12, right: 12, zIndex: 20 }} ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="btn btn-ghost btn-sm"
          style={{ width: 28, padding: 0, background: "color-mix(in oklch, var(--bg) 86%, transparent)", boxShadow: "var(--shadow-sm)" }}
        >
          <MoreHorizontal size={15} />
        </button>

        {showMenu && (
          <div className="panel" style={{ position: "absolute", right: 0, top: 32, width: 200, padding: 4, zIndex: 20, boxShadow: "var(--shadow-lg)" }} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => handleStartTitleEdit(e)}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <Pencil size={14} className="text-[var(--muted)]" /> Rename resume title
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/export/${resume.id}`); setShowMenu(false); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <Download size={14} className="text-[var(--muted)]" /> Download PDF
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/cover-letter/${resume.id}`); setShowMenu(false); }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
            >
              <Mail size={14} className="text-[var(--muted)]" /> Write cover letter
            </button>

            <button
              onClick={handleTogglePublic}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
            >
              {copied ? <Check size={14} className="text-[var(--good)]" /> : resume.isShared ? <EyeOff size={14} className="text-[var(--muted)]" /> : <Globe size={14} className="text-[var(--accent)]" />}
              {copied ? <span className="text-[var(--good)]">Copied link</span> : resume.isShared ? "Unpublish" : "Publish"}
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
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
              >
                <LinkIcon size={14} className="text-[var(--muted)]" /> Copy link
              </button>
            )}
            <hr className="hr my-1" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[13px] font-medium text-[var(--bad)] transition-colors hover:bg-[var(--bad-soft)]"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: 14 }} onClick={() => navigate(`/builder/${resume.id}`)}>
        <div style={{ display: "flex", alignItems: "start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditingTitle ? (
              <form onSubmit={handleSaveTitle} onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  value={draftTitle}
                  disabled={isSavingTitle}
                  aria-label="Resume title"
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={handleTitleKeyDown}
                  className="field"
                  style={{ height: 26, minHeight: 26, padding: "2px 6px", fontSize: 14, fontWeight: 500 }}
                />
                <button type="submit" aria-label="Save resume title" title="Save resume title" className="sr-only" disabled={isSavingTitle}>
                  <Check size={14} />
                </button>
                <button type="button" aria-label="Cancel title edit" title="Cancel title edit" className="sr-only" disabled={isSavingTitle} onClick={handleCancelTitleEdit}>
                  <X size={14} />
                </button>
                {titleError && (
                  <p className="mt-1 text-[11px] font-medium text-[var(--bad)]">{titleError}</p>
                )}
              </form>
            ) : (
              <div
                onDoubleClick={handleStartTitleEdit}
                style={{ fontWeight: 500, fontSize: 14, letterSpacing: "-.01em" }}
                className="truncate"
                title={displayTitle}
              >
                {displayTitle}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <span className={`pill ${statusColors[resume.status] || "pill-warn"}`}>
            <span className="dot" style={{ background: "currentColor" }} />
            {statusLabel}
          </span>
          <span style={{ color: "var(--faint)", fontSize: 11.5, marginLeft: "auto" }} className="mono">
            Edited {dateStr}
          </span>
        </div>
      </div>
    </div>
  );
}
