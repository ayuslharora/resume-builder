import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFirestore } from "../hooks/useFirestore";
import { useNavigate } from "react-router-dom";
import ResumeCard from "../components/dashboard/ResumeCard";
import EmptyState from "../components/dashboard/EmptyState";
import Spinner from "../components/ui/Spinner";
import { getCachedResumeList, setCachedResumeList } from "../services/resumeCache";

export default function Dashboard() {
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

  function handleCreate() {
    navigate(`/builder/new`);
  }

  if (loading) return <Spinner />;

  return (
    <div className="w-full max-w-7xl mx-auto fade-in">
      <div className="page-header">
        <h1 className="page-title">Project Workspace</h1>
        <div className="flex items-center gap-2">
           <p className="page-subtitle">My Resumes</p>
           {fromCache && (
             <span className="text-[10px] uppercase font-bold tracking-wider text-primary/70 animate-pulse bg-primary/10 px-2 py-0.5 rounded">
               Syncing
             </span>
           )}
        </div>
      </div>

      {resumes.length === 0 ? (
        <EmptyState onCreate={handleCreate} />
      ) : (
        <div className="resume-grid">
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
                } catch(e) { console.error(e); }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
