import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/useAuth";
import { useFirestore } from "../hooks/useFirestore";
import { User, Save, Camera, CheckCircle, BarChart3, Eye, Share2, FileText, TrendingUp, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { normalizeTimestamp, buildDailySeries } from "../utils/viewStats";

function sampleAvatarEdgeColor(img, size = 88) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, size, size);
  const cx = size / 2, cy = size / 2, r = size / 2 - 5;
  let rSum = 0, gSum = 0, bSum = 0;
  const samples = 32;
  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2;
    const x = Math.round(cx + r * Math.cos(angle));
    const y = Math.round(cy + r * Math.sin(angle));
    const [ri, gi, bi] = ctx.getImageData(x, y, 1, 1).data;
    rSum += ri; gSum += gi; bSum += bi;
  }
  return `rgb(${Math.round(rSum / samples)}, ${Math.round(gSum / samples)}, ${Math.round(bSum / samples)})`;
}

export default function Profile() {
  const { userDoc, currentUser, updateUserProfile } = useAuth();
  const { getUserResumes, getOwnerViewDetails, getOwnerViewCount } = useFirestore();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [ownerViews, setOwnerViews] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);
  const [chartRange, setChartRange] = useState("30d");
  const [avatarGlowColor, setAvatarGlowColor] = useState(null);
  const [displayName, setDisplayName] = useState(userDoc?.displayName || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userDoc?.photoURL) { setAvatarGlowColor(null); return; }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try { setAvatarGlowColor(sampleAvatarEdgeColor(img)); } catch {}
    };
    img.src = userDoc.photoURL;
  }, [userDoc?.photoURL]);

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    async function loadStats() {
      try {
        const [resumesResult, viewsResult, countResult] = await Promise.allSettled([
          getUserResumes(currentUser.uid),
          getOwnerViewDetails(currentUser.uid),
          getOwnerViewCount(currentUser.uid),
        ]);
        if (cancelled) return;

        if (resumesResult.status === "fulfilled") setResumes(resumesResult.value);
        else console.warn("Could not load resumes for profile:", resumesResult.reason);

        if (viewsResult.status === "fulfilled") setOwnerViews(viewsResult.value);
        else console.warn("Could not load view details for profile:", viewsResult.reason);

        if (countResult.status === "fulfilled") setTotalViews(countResult.value);
        else if (viewsResult.status === "fulfilled") setTotalViews(viewsResult.value.length);
      } catch (err) {
        console.error("Error loading stats for profile:", err);
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    }

    loadStats();
    return () => { cancelled = true; };
  }, [currentUser, getUserResumes, getOwnerViewDetails, getOwnerViewCount]);

  const RANGE_DAYS = { "7d": 7, "30d": 30, "3m": 90, "1y": 365 };
  const rangeDays = RANGE_DAYS[chartRange] ?? 30;
  const cutoff = Date.now() - rangeDays * 86400000;
  const filteredViews = ownerViews.filter(v => normalizeTimestamp(v.createdAt) >= cutoff);
  const dailySeries = buildDailySeries(filteredViews, rangeDays);

  const totalResumes = resumes.length;
  const sharedResumes = resumes.filter(r => r.isShared).length;

  const resumeViewCounts = {};
  for (const v of ownerViews) {
    resumeViewCounts[v.resumeId] = (resumeViewCounts[v.resumeId] || 0) + 1;
  }
  const publishedResumes = resumes.filter(r => r.isShared);
  const maxResumeViews = Math.max(...publishedResumes.map(r => resumeViewCounts[r.id] || 0), 1);

  const isGoogleUser = currentUser?.providerData?.some(p => p.providerId === "google.com");
  const googlePhotoURL = currentUser?.providerData?.find(p => p.providerId === "google.com")?.photoURL;

  const initials = displayName
    ? displayName.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "U";

  function handleSaveName(e) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setError("");
    // updateUserProfile is now optimistic — updates UI instantly, persists in background
    updateUserProfile({ displayName: displayName.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleUseGooglePhoto() {
    if (!googlePhotoURL) return;
    setError("");
    updateUserProfile({ photoURL: googlePhotoURL });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="app-page app-page-narrow profile-page fade-in">
      
      <div className="panel mb-6 relative overflow-hidden glass-strong">
        {/* Decorative background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-transparent pointer-events-none" />
        
        <div className="relative p-6 lg:p-8 flex flex-col lg:flex-row items-center lg:items-stretch gap-8">
          
          {/* Identity Section (Left) */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div
              className="profile-hero-avatar mb-4"
              style={avatarGlowColor ? {
                boxShadow: `0 0 16px 2px ${avatarGlowColor}30, 0 4px 16px -6px ${avatarGlowColor}40`
              } : undefined}
            >
              {userDoc?.photoURL ? (
                <img src={userDoc.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)] mb-1 tracking-tight">
              {displayName || "User"}
            </h1>
            <p className="text-[14px] text-[var(--muted)]">
              {currentUser?.email}
            </p>
            {currentUser?.metadata?.creationTime && (
              <div className="profile-member-badge">
                <CalendarDays size={11} />
                Member since {new Date(currentUser.metadata.creationTime).getFullYear()}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-[1px] bg-[var(--border)]" />
          <div className="lg:hidden h-[1px] w-full bg-[var(--border)]" />

          {/* Stats Section (Right) */}
          <div className="flex-1 w-full flex items-center justify-center">
            {loadingStats ? (
              <div className="flex items-center justify-center gap-10">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="skeleton h-10 w-10" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8 lg:gap-12">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-display text-4xl lg:text-5xl stat-number-gradient">{totalViews}</div>
                  <div className="lbl-mono text-[var(--muted)] flex items-center gap-1.5">
                    <Eye size={12} className="text-[var(--accent)]" /> Views
                  </div>
                </div>

                <div className="w-[1px] h-10 bg-[var(--border)]" />

                <div className="flex flex-col items-center gap-1">
                  <div className="h-display text-4xl lg:text-5xl stat-number-gradient">{sharedResumes}</div>
                  <div className="lbl-mono text-[var(--muted)] flex items-center gap-1.5">
                    <Share2 size={12} className="text-[var(--accent)]" /> Shared
                  </div>
                </div>

                <div className="w-[1px] h-10 bg-[var(--border)]" />

                <div className="flex flex-col items-center gap-1">
                  <div className="h-display text-4xl lg:text-5xl stat-number-gradient">{totalResumes}</div>
                  <div className="lbl-mono text-[var(--muted)] flex items-center gap-1.5">
                    <FileText size={12} className="text-[var(--accent)]" /> Built
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Chart Full Width */}
      {!loadingStats && totalViews > 0 && (
        <div className="panel mb-6 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="lbl-mono flex items-center gap-1.5">
              <TrendingUp size={14} className="text-[var(--accent)]" /> Views over time
            </div>
            <div className="tabs">
              {["7d", "30d", "3m", "1y"].map(r => (
                <button key={r} className="tab" data-active={chartRange === r} onClick={() => setChartRange(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 160 }}>
            <ProfileDailyChart data={dailySeries} />
          </div>
        </div>
      )}

      {/* 2-Column Grid for Settings and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Settings Column */}
        <div className="flex flex-col gap-6">
          <section className="panel p-6">
            <h2 className="profile-section-title mb-5 border-b border-[var(--border)] pb-3">
              <User size={15} className="text-[var(--accent)]" />
              Profile Settings
            </h2>

            {error && (
              <div className="profile-error mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveName} className="space-y-4 mb-6">
              <div>
                <label className="field-label">Display Name</label>
                <input
                  type="text"
                  className="input-field mt-1"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={!displayName.trim()}
                  className="btn-primary text-[13px] px-4 py-2"
                >
                  <Save size={14} /> Save Name
                </button>
                {saved && (
                  <span className="profile-saved fade-in">
                    <CheckCircle size={13} /> Saved!
                  </span>
                )}
              </div>
            </form>

            <div className="border-t border-[var(--border)] pt-5">
              <label className="field-label mb-3">Profile Photo</label>
              {isGoogleUser && googlePhotoURL ? (
                <div className="flex items-center gap-3">
                  <img src={googlePhotoURL} alt="Google" className="w-10 h-10 rounded-full border border-[var(--border)]" />
                  <button
                    onClick={handleUseGooglePhoto}
                    disabled={userDoc?.photoURL === googlePhotoURL}
                    className="btn btn-outline btn-sm"
                  >
                    {userDoc?.photoURL === googlePhotoURL ? "Using Google Photo" : "Use Google Photo"}
                  </button>
                </div>
              ) : (
                <p className="text-[13px] text-[var(--muted)]">
                  Sign in with Google to use your Google profile photo.
                </p>
              )}
            </div>
          </section>

          <section className="panel flex items-center justify-between p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-10 rounded-full blur-2xl pointer-events-none -mt-10 -mr-10" />
            <div className="relative">
              <h2 className="text-[14px] font-semibold text-[var(--text)]">Built by Ayush</h2>
              <p className="text-[12.5px] text-[var(--muted)]">Portfolio: Ayuslh.in</p>
            </div>
            <a 
              href="https://Ayuslh.in" 
              target="_blank" 
              rel="noreferrer" 
              className="relative inline-flex items-center justify-center px-4 py-2 text-[12.5px] font-bold rounded-lg transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              Visit
            </a>
          </section>
        </div>

        {/* Analytics Breakdown Column */}
        <div className="flex flex-col gap-6">
          {!loadingStats && publishedResumes.length > 0 ? (
            <section className="panel p-6">
              <h2 className="profile-section-title mb-5 border-b border-[var(--border)] pb-3">
                <BarChart3 size={15} className="text-[var(--accent)]" />
                Views by Resume
              </h2>
              <div className="space-y-4">
                {publishedResumes
                  .sort((a, b) => (resumeViewCounts[b.id] || 0) - (resumeViewCounts[a.id] || 0))
                  .map(r => {
                    const count = resumeViewCounts[r.id] || 0;
                    const pct = Math.round((count / maxResumeViews) * 100);
                    return (
                      <div
                        key={r.id}
                        className="stats-bar-row group"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/stats/${r.id}`)}
                        title={`View full stats for "${r.title}"`}
                      >
                        <div className="stats-bar-label w-32 flex-shrink-0 group-hover:text-[var(--text)] transition-colors">
                          <span className="truncate text-[13px] font-medium">
                            {r.title || "Untitled"}
                          </span>
                        </div>
                        <div className="stats-bar-track flex-1 h-2">
                          <div className="stats-bar-fill h-2" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="stats-bar-count w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
              </div>
            </section>
          ) : !loadingStats && totalViews === 0 ? (
            <div className="panel p-8 text-center flex flex-col justify-center items-center h-full min-h-[200px]">
              <Eye size={24} className="text-[var(--faint)] mx-auto mb-3" />
              <p className="text-[13.5px] text-[var(--muted)]">
                No views yet. Publish a resume and share the link to start tracking.
              </p>
            </div>
          ) : null}
        </div>

      </div>

    </div>
  );
}

function ProfileDailyChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const containerRef = useRef(null);

  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map(d => d.count), 1);
  const H = 80;
  const W = 100;
  const step = W / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: i * step,
    y: H - (d.count / maxVal) * H,
    count: d.count,
    label: d.label,
  }));

  const pathD = points.reduce((acc, p, i) =>
    acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${H} L 0 ${H} Z`;

  function handleMouseMove(e) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round(fraction * (data.length - 1))));
    setHoveredIdx(idx);
  }

  const hp = hoveredIdx !== null ? points[hoveredIdx] : null;
  const tipXPct = hp ? (hp.x / W) * 100 : 0;
  const tipYPct = hp ? (hp.y / H) * 100 : 0;
  const tipShift = tipXPct > 80 ? "-100%" : tipXPct < 20 ? "0%" : "-50%";

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <svg
        viewBox={`0 0 100 ${H}`}
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="profileGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} y1={H * f} x2={W} y2={H * f}
            stroke="var(--border)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        ))}

        {/* Vertical crosshair */}
        {hp && (
          <line x1={hp.x} y1={0} x2={hp.x} y2={H}
            stroke="var(--border-strong)" strokeWidth="1"
            strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        )}

        <path d={areaD} fill="url(#profileGrad)" />
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>

      {/* Hover dot — HTML so it stays circular (SVG circle distorts with preserveAspectRatio=none) */}
      {hp && (
        <div
          className="absolute pointer-events-none"
          style={{ left: `${tipXPct}%`, top: `${tipYPct}%`, transform: "translate(-50%, -50%)" }}
        >
          <div className="w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)] shadow-lg" />
        </div>
      )}

      {/* Tooltip */}
      {hp && (
        <div
          className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-lg text-[12px] whitespace-nowrap"
          style={{
            left: `${tipXPct}%`,
            top: `${tipYPct}%`,
            transform: `translate(${tipShift}, calc(-100% - 10px))`,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <span className="font-bold text-[var(--accent)]">{hp.count}</span>
          <span className="text-[var(--muted)] ml-1">{hp.count === 1 ? "view" : "views"}</span>
          <span className="text-[var(--faint)] ml-2 text-[11px]">{hp.label}</span>
        </div>
      )}

      {/* Date labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between pointer-events-none -mb-6">
        <span className="text-[11px] text-[var(--faint)] mono">{points[0]?.label}</span>
        {points.length > 2 && (
          <span className="text-[11px] text-[var(--faint)] mono">{points[Math.floor(points.length / 2)]?.label}</span>
        )}
        <span className="text-[11px] text-[var(--faint)] mono">{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}
