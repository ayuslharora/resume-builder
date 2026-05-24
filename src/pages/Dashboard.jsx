import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/useAuth";
import { useFirestore } from "../hooks/useFirestore";
import { useNavigate } from "react-router-dom";
import ResumeCard from "../components/dashboard/ResumeCard";
import EmptyState from "../components/dashboard/EmptyState";
import { getGraderHistory } from "../services/graderHistory";
import { CheckSquare, Eye, Grid2X2, LayoutList, Plus, Search } from "lucide-react";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { deleteResume, duplicateResume, getResumeViewCounts, getUserResumes, getUserGraderHistory } = useFirestore();
  const [resumes, setResumes] = useState([]);
  const [graderHistory, setGraderHistory] = useState(() => getGraderHistory());
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("grid");
  const navigate = useNavigate();

  const greetingName = useMemo(() => {
    const rawName = currentUser?.displayName?.trim();
    if (rawName) return rawName.split(/\s+/)[0];
    const emailLocal = currentUser?.email?.split("@")[0]?.trim();
    if (emailLocal) return emailLocal;
    return "there";
  }, [currentUser?.displayName, currentUser?.email]);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;

    async function loadResumes() {
      try {
        const data = await getUserResumes(currentUser.uid);
        const publishedIds = data.filter((resume) => resume.isShared).map((resume) => resume.id);
        let viewCounts = {};
        try {
          viewCounts = await getResumeViewCounts(publishedIds, currentUser.uid);
        } catch (countError) {
          console.warn("Could not load resume view counts:", countError);
        }
        if (cancelled) return;
        setResumes(data.map((resume) => ({
          ...resume,
          distinctViewCount: viewCounts[resume.id] || 0,
        })));

        getUserGraderHistory(currentUser.uid).then(history => {
          if (!cancelled && history.length) setGraderHistory(history);
        }).catch(err => {
          console.warn("Could not load grader history:", err);
        });
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
  }, [currentUser, getResumeViewCounts, getUserResumes, getUserGraderHistory]);

  function handleCreate() {
    navigate(`/builder/new`);
  }

  if (loading) return <DashboardSkeleton />;

  const publishedCount = resumes.filter(resume => resume.isShared).length;
  const avgAtsScore = getAverageScore(graderHistory);
  const scoreTrend = getScoreTrend(graderHistory);
  const bulletsRewritten = resumes.reduce((total, resume) => (
    total + getResumeRewriteCount(resume)
  ), 0);
  const totalViews = resumes.reduce((total, resume) => (
    total + (resume.distinctViewCount || 0)
  ), 0);
  const filteredResumes = resumes.filter((resume) => {
    const title = resume.title || "";
    const role = resume.targetRole || "";
    const matchesQuery = !query.trim()
      || title.toLowerCase().includes(query.toLowerCase())
      || role.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "all"
      || resume.status === filter
      || (filter === "published" && resume.isShared);

    return matchesQuery && matchesFilter;
  });

  return (
    <div className="app-page fade-in">
      <div className="mb-7 flex items-end gap-4">
        <div className="flex-1">
          <div className="lbl-mono mb-2">Workspace</div>
          <h1 className="h-display m-0 text-[30px]">
            {resumes.length > 0 ? "Welcome back, " : "Welcome, "}
            <span className="serif font-normal italic">{greetingName}</span>
          </h1>
          <p className="mt-1 text-[13.5px] text-[var(--muted)]">
            {resumes.length} resumes · {publishedCount} published
          </p>
        </div>
        <button className="btn btn-outline hidden sm:inline-flex" onClick={() => navigate("/grader")}>
          <CheckSquare size={14} /> Grade existing
        </button>
        <button className="btn btn-accent" onClick={handleCreate}>
          <Plus size={14} /> New resume
        </button>
      </div>

      {resumes.length > 0 && (
        <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Avg ATS score" value={avgAtsScore} suffix="/100" trend={scoreTrend} />
          <StatCard label="Resumes shared" value={publishedCount} />
          <StatCard label="Bullets rewritten" value={bulletsRewritten} />
          <StatCard label="Total views received" value={totalViews} />
        </div>
      )}
      
      {actionError && (
        <div className="mb-6 flex items-center justify-between rounded-md border border-[var(--bad)]/20 bg-[var(--bad-soft)] px-4 py-3 text-[var(--bad)]">
          <p className="font-medium">{actionError}</p>
          <button onClick={() => setActionError(null)} className="text-red-500 hover:text-red-700 font-bold px-2">&times;</button>
        </div>
      )}

      {resumes.length === 0 ? (
        <EmptyState onCreate={handleCreate} />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <label className="relative w-full lg:max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
                <Search size={14} />
              </span>
              <input
                className="field"
                placeholder="Search resumes..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ paddingLeft: 34 }}
              />
            </label>

            <div className="tabs overflow-x-auto">
              {[
                ["all", "All"],
                ["draft", "Draft"],
                ["generated", "Generated"],
                ["complete", "Complete"],
                ["published", "Published"],
              ].map(([key, label]) => (
                <button key={key} className="tab" data-active={filter === key} onClick={() => setFilter(key)}>
                  {label}
                </button>
              ))}
            </div>

            <span className="hidden flex-1 lg:block" />
            <div className="tabs hidden lg:inline-flex" style={{ padding: 2 }}>
              <button className="tab flex h-8 w-8 items-center justify-center p-1" data-active={view === "grid"} onClick={() => setView("grid")}>
                <Grid2X2 size={17} />
              </button>
              <button className="tab flex h-8 w-8 items-center justify-center p-1" data-active={view === "rows"} onClick={() => setView("rows")}>
                <LayoutList size={17} />
              </button>
            </div>
          </div>

          {filteredResumes.length === 0 ? (
            <div className="panel p-8 text-sm text-[var(--muted)]">No resumes match the current search.</div>
          ) : view === "grid" ? (
            <div className="resume-grid">
              {filteredResumes.map(resume => (
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
          ) : (
            <div className="panel overflow-hidden">
              {filteredResumes.map((resume, index) => (
                <ResumeRow
                  key={resume.id}
                  resume={resume}
                  isLast={index === filteredResumes.length - 1}
                  onOpen={() => navigate(`/builder/${resume.id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="app-page">
      {/* Header */}
      <div className="mb-7 flex items-end gap-4">
        <div className="flex-1">
          <div className="skeleton mb-2 h-3 w-20" />
          <div className="skeleton h-8 w-64" />
          <div className="skeleton mt-2 h-3 w-36" />
        </div>
        <div className="skeleton hidden h-9 w-32 sm:block" />
        <div className="skeleton h-9 w-28" />
      </div>

      {/* Stat cards */}
      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel p-4">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton mt-3 h-7 w-16" />
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="skeleton h-9 w-full lg:max-w-xs" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-8 w-16" />
          ))}
        </div>
      </div>

      {/* Resume card skeletons */}
      <div className="resume-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="panel overflow-hidden" style={{ padding: 0 }}>
            <div className="skeleton" style={{ aspectRatio: "1.7", borderRadius: "12px 12px 0 0" }} />
            <div style={{ padding: 14 }}>
              <div className="skeleton h-4 w-3/4" />
              <div className="mt-3 flex items-center gap-2">
                <div className="skeleton h-5 w-16" />
                <div className="skeleton ml-auto h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, suffix, trend, muted }) {
  return (
    <div className="panel p-4">
      <div className="lbl-mono">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <span className={`h-display text-[26px] ${muted ? "text-[var(--text-2)]" : "text-[var(--text)]"}`}>
          {value}
        </span>
        {suffix && <span className="text-[13px] text-[var(--muted)]">{suffix}</span>}
        {trend && <span className="pill pill-good ml-auto">+{trend}</span>}
      </div>
    </div>
  );
}

function getAverageScore(history) {
  const scores = history
    .map((entry) => Number(entry.score))
    .filter(Number.isFinite);

  if (!scores.length) return "—";
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function getScoreTrend(history) {
  const latest = Number(history[0]?.score);
  const previous = Number(history[1]?.score);

  if (!Number.isFinite(latest) || !Number.isFinite(previous)) return "";
  const delta = latest - previous;
  return delta > 0 ? delta : "";
}

function getResumeRewriteCount(resume) {
  return Number(resume.bulletsRewritten ?? resume.rewriteCount ?? resume.rewritesApplied ?? 0) || 0;
}

function formatLastGraded(value) {
  if (!value) return "Not yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not yet";

  const now = new Date();
  const today = date.toDateString() === now.toDateString();
  if (today) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function ResumeRow({ resume, isLast, onOpen }) {
  const statusColor = { complete: "good", generated: "accent", draft: "warn" }[resume.status] || "warn";

  return (
    <button
      onClick={onOpen}
      className="grid w-full grid-cols-[40px_1fr_auto_auto_auto] items-center gap-4 px-4 py-3 text-left"
      style={{ borderBottom: isLast ? "none" : "1px solid var(--border)" }}
    >
      <div className="h-10 w-8 rounded border border-[var(--border)] bg-[var(--surface)]" />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{resume.title || "Untitled Resume"}</div>
        <div className="truncate text-xs text-[var(--muted)]">{resume.targetRole || "No role specified"}</div>
      </div>
      <span className={`pill pill-${statusColor}`}>{resume.status || "draft"}</span>
      {resume.isShared && <span className="pill pill-accent hidden sm:inline-flex">Public</span>}
      {resume.isShared && (
        <span className="pill hidden sm:inline-flex">
          <Eye size={11} /> {formatViewCount(resume.distinctViewCount)}
        </span>
      )}
    </button>
  );
}

function formatViewCount(value) {
  const count = Number(value) || 0;
  return `${count} ${count === 1 ? "view" : "views"}`;
}
