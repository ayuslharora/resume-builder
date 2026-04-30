import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFirestore } from "../hooks/useFirestore";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import ResumeCard from "../components/dashboard/ResumeCard";
import EmptyState from "../components/dashboard/EmptyState";
import Spinner from "../components/ui/Spinner";
import { getCachedResumeList, setCachedResumeList } from "../services/resumeCache";
import { mergeCachedAndServerResumes } from "../services/resumePersistence";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { deleteResume, duplicateResume } = useFirestore();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const cached = getCachedResumeList(currentUser.uid);
    if (cached.length > 0) {
      setResumes(cached);
      setLoading(false);
      setFromCache(true);
    }

    const hangTimeout = setTimeout(() => {
      setLoading(false);
      setFromCache(false);
    }, 5000);

    const q = query(
      collection(db, "resumes"),
      where("userId", "==", currentUser.uid),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        clearTimeout(hangTimeout);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const merged = mergeCachedAndServerResumes(data, getCachedResumeList(currentUser.uid));
        setResumes(merged);
        setLoading(false);
        setFromCache(merged.length > data.length);
        setCachedResumeList(currentUser.uid, merged);
      },
      (error) => {
        clearTimeout(hangTimeout);
        console.error("Error fetching resumes:", error);
        setLoading(false);
        setFromCache(false);
      }
    );

    return () => {
      clearTimeout(hangTimeout);
      unsubscribe();
    };
  }, [currentUser]);

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
