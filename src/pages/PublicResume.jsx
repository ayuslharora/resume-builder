import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import ResumePreview from "../components/resume/ResumePreview";
import { AlertCircle, ChevronLeft } from "lucide-react";
import Loading from "./Loading";
import { getOrCreateResumeViewerId } from "../services/resumeViewTracking";

export default function PublicResume() {
  const { token } = useParams();
  const { getResumeByShareToken, recordResumeView } = useFirestore();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadResume() {
      try {
        const data = await getResumeByShareToken(token);
        if (!data) {
          setError("Resume not found.");
        } else if (!data.isShared) {
          setError("This resume is not published.");
        } else {
          setResume(data);
          recordResumeView({
            resumeId: data.id,
            ownerId: data.userId,
            viewerId: getOrCreateResumeViewerId(),
          }).catch((viewError) => {
            console.warn("Failed to record resume view:", viewError);
          });
        }
      } catch (err) {
        setError("Failed to load resume.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, [token, getResumeByShareToken, recordResumeView]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="app-design shared-resume-error-shell">
        <div className="shared-resume-error-card panel">
          <Link to="/" className="shared-resume-error-brand">
            <span className="shared-resume-brand-mark">
              <img src="/favicon.svg" alt="" aria-hidden="true" className="h-full w-full" />
            </span>
            <span>
              Resu<span className="serif italic font-normal">Me</span>
            </span>
          </Link>
          <div className="shared-resume-error-icon">
            <AlertCircle size={18} />
          </div>
          <p className="lbl-mono">Shared resume</p>
          <h1 className="h-display">Resume unavailable</h1>
          <p className="shared-resume-error-copy">{error}</p>
          <Link to="/" className="btn btn-accent btn-sm">
            <ChevronLeft size={14} /> Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="app-design min-h-screen pb-16" style={{ background: "var(--surface)" }}>
      <header
        className="shared-resume-navbar border-b border-[var(--border)]"
      >
        <div className="container shared-resume-nav-inner">
          <Link to="/" className="flex min-w-0 items-center gap-2 text-[var(--text)]">
            <span className="shared-resume-brand-mark">
              <img src="/favicon.svg" alt="" aria-hidden="true" className="h-full w-full" />
            </span>
            <span className="hidden truncate text-[15px] font-semibold tracking-[-0.01em] sm:block">
              Resu<span className="serif italic font-normal">Me</span>
            </span>
          </Link>
          <span className="flex-1" />
          <div className="flex min-w-0 items-center gap-3">
            <span className="shared-resume-credit mono hidden text-[12.5px] text-[var(--muted)] md:inline-flex">
              ResuMe by Ayush · built with care ·{" "}
            </span>
            <a
              href="https://Ayuslh.in"
              target="_blank"
              rel="noreferrer"
              className="ulink hidden text-[13px] text-[var(--text-2)] sm:inline-flex"
            >
              Ayuslh.in
            </a>
            <Link to="/" className="btn btn-accent btn-sm">
              Build yours
            </Link>
          </div>
        </div>
      </header>

      <div className="mt-8 mx-auto w-full max-w-[850px] px-4 sm:px-6">
        <div className="bg-white shadow-2xl rounded-sm overflow-hidden">
          <ResumePreview
            resumeData={resume.resumeData}
            templateId={resume.templateId}
            isEditing={false}
            scale={1}
          />
        </div>
      </div>
    </div>
  );
}
