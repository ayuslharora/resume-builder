import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFirestore } from "../hooks/useFirestore";
import { useNavigate } from "react-router-dom";
import ResumeCard from "../components/dashboard/ResumeCard";
import { FilePlus } from "lucide-react";
import Spinner from "../components/ui/Spinner";
import { getCachedResumeList, setCachedResumeList } from "../services/resumeCache";

export default function Resumes() {
  const { currentUser } = useAuth();
  const { deleteResume, duplicateResume, getUserResumes } = useFirestore();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function loadResumes() {
      const cached = getCachedResumeList(currentUser.uid);
      if (cached.length > 0) {
        setResumes(cached);
        setFromCache(true);
      }

      try {
        const data = await getUserResumes(currentUser.uid);
        if (cancelled) return;
        setResumes(data);
        setFromCache(false);
        setCachedResumeList(currentUser.uid, data);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching resumes:", error);
          setFromCache(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadResumes();
    return () => {
      cancelled = true;
    };
  }, [currentUser, getUserResumes]);

  if (loading) return <Spinner />;

  return (
    <div className="w-full max-w-7xl relative fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[0.24em] uppercase text-primary/80 mb-3">
              Resume Library
            </div>
            <h1 className="page-title mb-2">My Resumes</h1>
            <p className="page-subtitle flex flex-wrap items-center gap-x-2 gap-y-1 max-w-2xl">
              <span className="w-2 h-2 rounded-full bg-primary shadow-ambient inline-block"></span>
              {resumes.length} resume{resumes.length !== 1 ? "s" : ""} found
              {fromCache && (
                <span className="ml-1 text-[10px] font-bold text-primary/70 animate-pulse uppercase tracking-wider">
                  · syncing
                </span>
              )}
            </p>
          </div>
          <button onClick={() => navigate("/builder/new")} className="btn-primary self-start md:self-auto">
            <FilePlus size={16} />
            New Resume
          </button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="flex min-h-[25rem] justify-center items-center rounded-xl px-6 py-10"
          style={{
            background: "rgba(25,31,49,0.3)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px dashed rgba(6,182,212,0.2)"
          }}>
          <div className="text-center">
            <div className="w-16 h-16 text-primary rounded-full flex justify-center items-center mx-auto mb-6"
              style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)", boxShadow: "0 0 20px rgba(6,182,212,0.1)" }}>
              <FilePlus size={28} />
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-2">No Resumes Yet</h3>
            <p className="text-on-surface-variant mb-8 max-w-sm px-4 mx-auto leading-relaxed">
              You haven't created any resumes yet. Click below to build your first one.
            </p>
            <button onClick={() => navigate("/builder/new")} className="btn-primary px-8 py-3 text-base">
              Build New Resume
            </button>
          </div>
        </div>
      ) : (
        <div className="resume-grid pt-1">
          {resumes.map(resume => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDelete={() => {
                setResumes(prev => prev.filter(r => r.id !== resume.id));
                deleteResume(resume.id).catch(console.error);
              }}
              onDuplicate={async () => {
                try {
                  await duplicateResume(resume.id);
                } catch (e) { console.error(e); }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
