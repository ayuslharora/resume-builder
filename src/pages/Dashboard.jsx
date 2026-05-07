import { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useFirestore } from "../hooks/useFirestore";
import { useNavigate } from "react-router-dom";
import ResumeCard from "../components/dashboard/ResumeCard";
import EmptyState from "../components/dashboard/EmptyState";
import Spinner from "../components/ui/Spinner";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { deleteResume, duplicateResume, getUserResumes } = useFirestore();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function loadResumes() {
      try {
        const data = await getUserResumes(currentUser.uid);
        if (cancelled) return;
        setResumes(data);
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching resumes:", error);
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
        </div>
      </div>
      
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex justify-between items-center">
          <p className="font-medium">{actionError}</p>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
        </div>
      )}

      {resumes.length === 0 ? (
        <EmptyState onCreate={handleCreate} />
      ) : (
        <div className="resume-grid">
          {resumes.map(resume => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onDelete={async () => {
                try {
                  setActionError(null);
                  await deleteResume(resume.id);
                  setResumes(prev => prev.filter(r => r.id !== resume.id));
                } catch (error) {
                  console.error(error);
                  setActionError("Failed to delete resume: " + error.message);
                }
              }}
              onRename={(resumeId, title) => {
                setResumes(prev => prev.map(r => (
                  r.id === resumeId ? { ...r, title } : r
                )));
              }}
              onPublishChange={(resumeId, publishState) => {
                setResumes(prev => prev.map(r => (
                  r.id === resumeId ? { ...r, ...publishState } : r
                )));
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
