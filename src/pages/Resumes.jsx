import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useFirestore } from "../hooks/useFirestore";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import ResumeCard from "../components/dashboard/ResumeCard";
import { FilePlus } from "lucide-react";
import Spinner from "../components/ui/Spinner";
import { getCachedResumeList, setCachedResumeList } from "../services/resumeCache";

export default function Resumes() {
  const { currentUser } = useAuth();
  const { deleteResume, duplicateResume } = useFirestore();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // ── 1. Instant render from localStorage ─────────────────────────────────
    const cached = getCachedResumeList(currentUser.uid);
    if (cached.length > 0) {
      setResumes(cached);
      setLoading(false);
      setFromCache(true);
    }

    // ── 2. Fallback: stop spinner if Firebase hangs ──────────────────────────
    const hangTimeout = setTimeout(() => {
      setLoading(false);
      setFromCache(false);
    }, 5000);

    // ── 3. Live Firebase subscription ────────────────────────────────────────
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
        setResumes(data);
        setLoading(false);
        setFromCache(false);
        setCachedResumeList(currentUser.uid, data);
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

  if (loading) return <Spinner />;

  return (
    <div className="w-full max-w-7xl relative fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">My Resumes</h1>
            <p className="page-subtitle flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary shadow-ambient inline-block"></span>
              {resumes.length} resume{resumes.length !== 1 ? "s" : ""} found
              {fromCache && (
                <span className="ml-1 text-[10px] font-bold text-primary/70 animate-pulse uppercase tracking-wider">
                  · syncing
                </span>
              )}
            </p>
          </div>
          <button onClick={() => navigate("/builder/new")} className="btn-primary">
            <FilePlus size={16} />
            New Resume
          </button>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="flex justify-center items-center h-64 rounded-xl"
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
                } catch (e) { console.error(e); }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
