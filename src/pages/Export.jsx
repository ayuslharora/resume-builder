import { useEffect, useRef, useState, Suspense } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import ResumePreview from "../components/resume/ResumePreview";
import { templates } from "../components/templates";
import { Download, FileText, ArrowLeft, Home, Globe, EyeOff, Link as LinkIcon, Check, AlertTriangle } from "lucide-react";
import Spinner from "../components/ui/Spinner";
import { buildSharedResumeUrl, createShareToken } from "../services/shareResume";
import { stripResumeHtml } from "../services/resumeHtmlSanitizer";
import FeedbackWidget from "../components/ui/FeedbackWidget";

export default function Export() {
  const { resumeId } = useParams();
  const location = useLocation();
  const stateBuilderData = location.state?.builderData;
  const [resumeData, setResumeData] = useState(() => (
    resumeId === "new" && stateBuilderData ? stateBuilderData.resumeData : null
  ));
  const [templateId, setTemplateId] = useState(() => (
    resumeId === "new" && stateBuilderData ? stateBuilderData.templateId : null
  ));
  const [loading, setLoading] = useState(() => !(resumeId === "new" && stateBuilderData));
  const [exportingType, setExportingType] = useState(null);
  const [isShared, setIsShared] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [resumeHeight, setResumeHeight] = useState(0);
  const previewRootRef = useRef(null);
  const { getResume, updateResume } = useFirestore();
  const navigate = useNavigate();

  // Callback ref: attaches ResizeObserver the moment the shadow div mounts,
  // even when templateId loads asynchronously after initial render.
  const shadowCallbackRef = (el) => {
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setResumeHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
  };

  useEffect(() => {
    // Case 1: brand-new resume that was never saved (id="new")
    if (resumeId === "new" && stateBuilderData) {
      return;
    }

    // Case 2: real Firestore id — try to fetch, fall back to nav state on any failure
    const hangTimeout = setTimeout(() => {
      // Timed out waiting for Firestore — use bundled state if present
      if (stateBuilderData) {
        setResumeData(stateBuilderData.resumeData);
        setTemplateId(stateBuilderData.templateId);
      }
      setLoading(false);
    }, 4000);

    getResume(resumeId)
      .then((data) => {
        clearTimeout(hangTimeout);
        if (data && data.resumeData) {
          setResumeData(data.resumeData);
          setTemplateId(data.templateId);
          setIsShared(Boolean(data.isShared));
          setShareToken(data.shareToken || null);
        } else if (stateBuilderData) {
          setResumeData(stateBuilderData.resumeData);
          setTemplateId(stateBuilderData.templateId);
        }
        setLoading(false);
      })
      .catch((e) => {
        clearTimeout(hangTimeout);
        console.error("Firestore fetch failed, using local state:", e);
        if (stateBuilderData) {
          setResumeData(stateBuilderData.resumeData);
          setTemplateId(stateBuilderData.templateId);
        }
        setLoading(false);
      });

    return () => clearTimeout(hangTimeout);
  }, [getResume, resumeId, stateBuilderData]);

  if (loading) return <Spinner />;
  if (!resumeData) return (
    <div className="app-design flex min-h-screen flex-col items-center justify-center bg-[var(--surface)] p-8">
      <div className="panel max-w-md p-10 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-[14px] bg-[var(--accent-soft)] text-[var(--accent)]">
          <FileText size={26} />
        </div>
        <h2 className="h-display mb-3 text-2xl">No Resume Selected</h2>
        <p className="mb-8 leading-relaxed text-[var(--muted)]">
          To download a resume, complete the builder flow and click <strong className="text-[var(--accent)]">"Export Resume"</strong> from the editor, or open an existing resume from your dashboard.
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="btn btn-accent"
          >
            Go to Dashboard
          </button>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    </div>
  );

  const handlePrintPDF = () => {
    window.print();
  };

  const handleDownloadDOCX = async () => {
    try {
      setExportingType('docx');
      const { exportDOCX } = await import("../services/export");
      await exportDOCX({
        fileName: `Resume_${stripResumeHtml(resumeData.personalInfo?.fullName).replace(/\s+/g, '_') || 'Export'}`,
        templateId,
        resumeData,
      });
    } catch (e) {
      alert("Failed to export DOCX: " + e.message);
    } finally {
      setExportingType(null);
    }
  };

  const handleTogglePublish = async () => {
    if (!resumeId || resumeId === "new") return;
    try {
      setShareBusy(true);
      const nextShared = !isShared;
      const nextToken = shareToken || createShareToken();
      await updateResume(resumeId, {
        isShared: nextShared,
        shareToken: nextToken,
      });
      setIsShared(nextShared);
      setShareToken(nextToken);

      if (nextShared) {
        const url = buildSharedResumeUrl(window.location.origin, nextToken);
        await navigator.clipboard.writeText(url);
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2000);
      }
    } catch (err) {
      alert("Failed to update publish status: " + err.message);
    } finally {
      setShareBusy(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareToken) return;
    try {
      const url = buildSharedResumeUrl(window.location.origin, shareToken);
      await navigator.clipboard.writeText(url);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2000);
    } catch (err) {
      alert("Failed to copy link: " + err.message);
    }
  };

  return (
    <div className="app-design flex min-h-screen flex-col bg-[var(--surface)]">
      {/* ── Sticky header bar ── */}
      <header className="print-hide sticky top-0 z-10 flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--bg)] px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate('/dashboard')} className="btn btn-ghost btn-sm">
            <Home size={13} /> Dashboard
          </button>
          <button onClick={() => navigate(`/builder/${resumeId}`)} className="btn btn-ghost btn-sm">
            <ArrowLeft size={13} /> Back to editor
          </button>
          <span className="v-hr hidden sm:block" style={{ height: 18 }} />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">
              {stripResumeHtml(resumeData.personalInfo?.fullName) || "Resume"}
            </div>
            <div className="mono text-[11.5px] text-[var(--muted)]">
              Ready to export
            </div>
          </div>
        </div>
        <span className="hidden flex-1 lg:block" />
        <div className="flex min-h-[40px] flex-wrap items-center gap-2 lg:justify-end">
            <>
              <button
                onClick={handleTogglePublish}
                disabled={shareBusy || resumeId === "new"}
                className="btn btn-outline btn-sm disabled:opacity-50"
              >
                {isShared ? <EyeOff size={13} /> : <Globe size={13} />}
                {isShared ? "Unpublish" : "Publish"}
              </button>
              {isShared && shareToken && (
                <button
                  onClick={handleCopyShareLink}
                  className="btn btn-outline btn-sm"
                >
                  {copiedShareLink ? <Check size={13} className="text-[var(--good)]" /> : <LinkIcon size={13} />}
                  {copiedShareLink ? "Copied" : "Copy Link"}
                </button>
              )}
              <button 
                 onClick={handleDownloadDOCX} 
                 disabled={exportingType || shareBusy}
                 className="btn btn-outline btn-sm disabled:opacity-50"
              >
                <FileText size={13} /> {exportingType === 'docx' ? 'Preparing...' : 'DOCX'}
              </button>
              <button 
                 onClick={handlePrintPDF}
                 disabled={shareBusy}
                 className="btn btn-accent btn-sm disabled:opacity-50"
              >
                <Download size={13} /> Save as PDF
              </button>
            </>
        </div>
      </header>

      {/* ── Resume preview ── */}
      <main className="scroll flex-1 overflow-y-auto px-4 py-8 print-resume-wrapper sm:px-6">
        <div className="mx-auto w-full max-w-[1120px]">

          {resumeHeight > 1122 && (
            <div className="print-hide flex justify-center mb-6">
              <div className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-sm text-amber-300 shadow-sm">
                <AlertTriangle size={14} className="shrink-0" />
                <span>
                  Your resume needs some adjustments — it will download as{" "}
                  <span className="font-semibold">2 pages</span>. Go back to the editor and shorten content or use{" "}
                  <span className="font-semibold">Fit Me</span>.
                </span>
              </div>
            </div>
          )}
          <div ref={previewRootRef} className="flex justify-center overflow-x-auto print-resume-wrapper">
            <div
              className="paper print-resume-document mx-auto"
              style={{ width: '850px', flexShrink: 0 }}
            >
              <ResumePreview
                resumeData={resumeData}
                templateId={templateId}
                isEditing={false}
                scale={1}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Hidden shadow render at 794px (PDF width) with isEditing=false for accurate height */}
      {templates[templateId] && (() => {
        const { component: TemplateComponent } = templates[templateId];
        return (
          <div
            ref={shadowCallbackRef}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: '-9999px',
              width: '794px',
              visibility: 'hidden',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          >
            <Suspense fallback={null}>
              <TemplateComponent resumeData={resumeData} isEditing={false} />
            </Suspense>
          </div>
        );
      })()}
      <FeedbackWidget />
    </div>
  );
}
