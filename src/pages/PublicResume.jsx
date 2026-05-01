import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import ResumePreview from "../components/resume/ResumePreview";
import { AlertCircle, ChevronLeft, FileText } from "lucide-react";
import Loading from "./Loading";

export default function PublicResume() {
  const { token } = useParams();
  const { getResumeByShareToken } = useFirestore();
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
        }
      } catch (err) {
        setError("Failed to load resume.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadResume();
  }, [token, getResumeByShareToken]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "var(--surface)", color: "var(--on-surface)" }}>
        <div className="max-w-md w-full text-center p-8 rounded-2xl" style={{ background: "rgba(25,31,49,0.5)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-on-surface-variant mb-6">{error}</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ChevronLeft size={16} /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16" style={{ background: "var(--surface)" }}>
      {/* Simple Header */}
      <header className="h-14 border-b px-6 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md"
        style={{ background: "rgba(7,13,31,0.8)", borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]"
            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)" }}
          >
            <FileText size={16} className="text-surface" />
          </div>
          <span className="font-bold tracking-tight text-white hidden sm:block">ResuMe</span>
        </div>
        <div className="text-sm font-medium text-on-surface-variant flex items-center gap-4">
          <a
            href="https://Ayuslh.in"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-white"
          >
            Created by Ayush
          </a>
          <Link to="/" className="btn-primary py-1.5 px-4 text-xs">Build Yours</Link>
        </div>
      </header>

      {/* Resume Container */}
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
