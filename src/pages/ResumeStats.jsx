import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFirestore } from "../hooks/useFirestore";
import { useAuth } from "../context/useAuth";
import {
  BarChart3, Eye, Globe, Monitor, Smartphone, Tablet,
  ExternalLink, Clock, ArrowLeft, TrendingUp, Users
} from "lucide-react";
import { normalizeTimestamp, buildDailySeries } from "../utils/viewStats";

const RANGE_OPTIONS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "3m", days: 90 },
  { label: "1y", days: 365 },
];

export default function ResumeStats() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getResume, getResumeViewDetails } = useFirestore();

  const [resume, setResume] = useState(null);
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  useEffect(() => {
    if (!currentUser || !resumeId) return;
    let cancelled = false;

    async function load() {
      try {
        const resumeData = await getResume(resumeId);
        // Auth-gate: redirect if not the owner
        if (!resumeData || resumeData.userId !== currentUser.uid) {
          navigate("/dashboard", { replace: true });
          return;
        }
        if (cancelled) return;
        setResume(resumeData);
      } catch (err) {
        console.error("Failed to load resume:", err);
        if (!cancelled) navigate("/dashboard", { replace: true });
        return;
      }

      // Separately fetch view details — failure here shows empty state, not a redirect
      try {
        const viewData = await getResumeViewDetails(resumeId, currentUser.uid);
        if (!cancelled) setViews(viewData);
      } catch (err) {
        console.warn("Could not load view details:", err);
        // Keep views as [] — the page will show "no views yet"
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [resumeId, currentUser, getResume, getResumeViewDetails, navigate]);

  const rangeDays = RANGE_OPTIONS.find(r => r.label === range)?.days ?? 30;
  const cutoff = Date.now() - rangeDays * 86400000;
  const filteredViews = views.filter(v => normalizeTimestamp(v.createdAt) >= cutoff);

  const totalViews = filteredViews.length;
  const viewsWithDuration = filteredViews.filter(v => v.duration > 0);
  const avgDuration = viewsWithDuration.length
    ? Math.round(viewsWithDuration.reduce((s, v) => s + v.duration, 0) / viewsWithDuration.length)
    : null;
  const countryCounts = countBy(filteredViews, "country");
  const referrerCounts = countBy(filteredViews, "referrer");
  const deviceCounts = countBy(filteredViews, "device");
  const osCounts = countBy(filteredViews, "os");
  const topCountries = sortedEntries(countryCounts);
  const topReferrers = sortedEntries(referrerCounts);
  const maxCountry = topCountries[0]?.[1] || 1;
  const maxReferrer = topReferrers[0]?.[1] || 1;
  const dailyData = buildDailySeries(filteredViews, rangeDays);
  const mobileCount = deviceCounts["Mobile"] || 0;
  const desktopCount = deviceCounts["Desktop"] || 0;
  const tabletCount = deviceCounts["Tablet"] || 0;

  if (loading) return <StatsPageSkeleton />;

  return (
    <div className="app-page app-design fade-in">
      {/* Header */}
      <div className="mb-7 flex items-start gap-4">
        <div className="flex-1">
          <div className="lbl-mono mb-2">Resume Analytics</div>
          <h1 className="h-display m-0 text-[28px] flex items-center gap-2">
            <BarChart3 size={22} className="text-[var(--accent)]" />
            {resume?.title || "Untitled Resume"}
          </h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            {resume?.isShared ? "Published · " : ""}
            {totalViews} {totalViews === 1 ? "view" : "views"} in the selected period
          </p>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={13} /> Back
        </button>
      </div>

      {/* Time range selector */}
      <div className="mb-6 flex items-center gap-3">
        <span className="lbl-mono">Period</span>
        <div className="tabs">
          {RANGE_OPTIONS.map(({ label }) => (
            <button
              key={label}
              className="tab"
              data-active={range === label}
              onClick={() => setRange(label)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {totalViews === 0 ? (
        <div className="panel p-12 text-center">
          <Eye size={32} className="text-[var(--faint)] mx-auto mb-3" />
          <h2 className="h-display text-[18px] mb-1">No views in this period</h2>
          <p className="text-[13px] text-[var(--muted)]">
            {views.length > 0
              ? "Try a wider time range — you have views outside this period."
              : "Share your resume link to start collecting analytics."}
          </p>
        </div>
      ) : (
        <>
          {/* Top stats row */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Total views" value={totalViews} icon={<Eye size={14} />} />
            <StatCard
              label="Countries"
              value={Object.keys(countryCounts).filter(c => c !== "Unknown").length || 0}
              icon={<Globe size={14} />}
            />
            <StatCard label="Avg time" value={formatDuration(avgDuration)} icon={<Clock size={14} />} />
            <StatCard label="Top device" value={getTopKey(deviceCounts)} icon={<Monitor size={14} />} />
            <StatCard label="Top source" value={getTopKey(referrerCounts)} icon={<ExternalLink size={14} />} />
          </div>

          {/* Daily chart */}
          <div className="panel mb-6 p-5">
            <h2 className="lbl-mono mb-4 flex items-center gap-1.5">
              <TrendingUp size={12} /> Views over time
            </h2>
            <DailyChart data={dailyData} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Locations */}
            <div className="panel p-5">
              <h2 className="lbl-mono mb-4 flex items-center gap-1.5">
                <Globe size={12} /> Locations
              </h2>
              {topCountries.length === 0 ? (
                <p className="text-[13px] text-[var(--muted)]">No location data yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {topCountries.map(([country, count]) => (
                    <div key={country} className="stats-bar-row">
                      <div className="stats-bar-label" style={{ width: 150, minWidth: 150 }}>
                        <span className="stats-flag">{countryCodeToFlag(getCountryCode(filteredViews, country))}</span>
                        <span className="truncate text-[12.5px]">{country}</span>
                      </div>
                      <div className="stats-bar-track flex-1">
                        <div className="stats-bar-fill" style={{ width: `${Math.round((count / maxCountry) * 100)}%` }} />
                      </div>
                      <span className="stats-bar-count">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Traffic sources */}
            <div className="panel p-5">
              <h2 className="lbl-mono mb-4 flex items-center gap-1.5">
                <ExternalLink size={12} /> Traffic sources
              </h2>
              {topReferrers.length === 0 ? (
                <p className="text-[13px] text-[var(--muted)]">No referrer data.</p>
              ) : (
                <div className="space-y-2.5">
                  {topReferrers.map(([referrer, count]) => (
                    <div key={referrer} className="stats-bar-row">
                      <div className="stats-bar-label" style={{ width: 150, minWidth: 150 }}>
                        <span className="stats-tag-dot" />
                        <span className="truncate text-[12.5px]">{referrer}</span>
                      </div>
                      <div className="stats-bar-track flex-1">
                        <div className="stats-bar-fill" style={{ width: `${Math.round((count / maxReferrer) * 100)}%` }} />
                      </div>
                      <span className="stats-bar-count">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Devices */}
            <div className="panel p-5">
              <h2 className="lbl-mono mb-4 flex items-center gap-1.5">
                <Monitor size={12} /> Devices
              </h2>
              <div className="stats-device-row">
                <DeviceBlock icon={<Monitor size={16} />} label="Desktop" count={desktopCount} total={totalViews} />
                <DeviceBlock icon={<Smartphone size={16} />} label="Mobile" count={mobileCount} total={totalViews} />
                <DeviceBlock icon={<Tablet size={16} />} label="Tablet" count={tabletCount} total={totalViews} />
              </div>
              {/* OS breakdown */}
              <div className="mt-4 space-y-2">
                {sortedEntries(osCounts).map(([os, count]) => (
                  <div key={os} className="flex items-center gap-3">
                    <span className="text-[12px] text-[var(--text-2)] w-20">{os}</span>
                    <div className="stats-bar-track flex-1">
                      <div className="stats-bar-fill" style={{ width: `${Math.round((count / totalViews) * 100)}%` }} />
                    </div>
                    <span className="stats-bar-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full view history */}
            <div className="panel p-5">
              <h2 className="lbl-mono mb-4 flex items-center gap-1.5">
                <Clock size={12} /> View history
              </h2>
              <div className="space-y-1 max-h-72 overflow-y-auto stats-scroll">
                {filteredViews.map((view, i) => (
                  <div key={view.id || i} className="stats-recent-row">
                    <span className="stats-flag text-[15px]">{countryCodeToFlag(view.countryCode)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] text-[var(--text-2)] truncate">
                        {view.country !== "Unknown"
                          ? view.city !== "Unknown" ? `${view.city}, ${view.country}` : view.country
                          : "Unknown location"}
                      </div>
                      <div className="text-[11px] text-[var(--faint)]">{view.referrer} · {view.device} · {view.os}</div>
                    </div>
                    <span className="text-[11px] text-[var(--faint)] mono whitespace-nowrap">
                      {formatRelativeTime(view.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ label, value, icon }) {
  return (
    <div className="panel p-4">
      <div className="lbl-mono flex items-center gap-1.5">
        <span className="text-[var(--accent)]">{icon}</span>
        {label}
      </div>
      <div className="mt-1 h-display text-[26px] text-[var(--text)] truncate">{value}</div>
    </div>
  );
}

function DeviceBlock({ icon, label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="stats-device-chip flex-1">
      <div className="flex items-center gap-1.5 text-[var(--muted)]">{icon}</div>
      <div className="text-[11.5px] font-medium text-[var(--text-2)]">{label}</div>
      <div className="h-display text-[20px] text-[var(--text)]">{count}</div>
      <div className="text-[10.5px] text-[var(--faint)] mono">{pct}%</div>
    </div>
  );
}

function DailyChart({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const containerRef = useRef(null);

  if (!data.length) return null;
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
    setHoveredIdx(Math.max(0, Math.min(data.length - 1, Math.round(fraction * (data.length - 1)))));
  }

  const hp = hoveredIdx !== null ? points[hoveredIdx] : null;
  const tipXPct = hp ? (hp.x / W) * 100 : 0;
  const tipYPct = hp ? (hp.y / H) * 100 : 0;
  const tipShift = tipXPct > 80 ? "-100%" : tipXPct < 20 ? "0%" : "-50%";

  return (
    <div ref={containerRef} className="relative" style={{ height: 100 }}
      onMouseMove={handleMouseMove} onMouseLeave={() => setHoveredIdx(null)}>
      <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="w-full h-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="statsGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={0} y1={H * f} x2={W} y2={H * f}
            stroke="var(--border)" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
        ))}
        {hp && (
          <line x1={hp.x} y1={0} x2={hp.x} y2={H}
            stroke="var(--border-strong)" strokeWidth="1"
            strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
        )}
        <path d={areaD} fill="url(#statsGrad)" />
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>

      {hp && (
        <div className="absolute pointer-events-none"
          style={{ left: `${tipXPct}%`, top: `${tipYPct}%`, transform: "translate(-50%, -50%)" }}>
          <div className="w-3 h-3 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)] shadow-lg" />
        </div>
      )}

      {hp && (
        <div className="absolute pointer-events-none z-10 px-2.5 py-1.5 rounded-lg text-[12px] whitespace-nowrap"
          style={{
            left: `${tipXPct}%`, top: `${tipYPct}%`,
            transform: `translate(${tipShift}, calc(-100% - 10px))`,
            background: "var(--surface-2)", border: "1px solid var(--border)",
          }}>
          <span className="font-bold text-[var(--accent)]">{hp.count}</span>
          <span className="text-[var(--muted)] ml-1">{hp.count === 1 ? "view" : "views"}</span>
          <span className="text-[var(--faint)] ml-2 text-[11px]">{hp.label}</span>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 flex justify-between pointer-events-none -mb-5">
        <span className="text-[10px] text-[var(--faint)] mono">{points[0]?.label}</span>
        {points.length > 2 && (
          <span className="text-[10px] text-[var(--faint)] mono">{points[Math.floor(points.length / 2)]?.label}</span>
        )}
        <span className="text-[10px] text-[var(--faint)] mono">{points[points.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function StatsPageSkeleton() {
  return (
    <div className="app-page fade-in">
      <div className="mb-7">
        <div className="skeleton h-2.5 w-24 mb-3" />
        <div className="skeleton h-8 w-64 mb-2" />
        <div className="skeleton h-3 w-40" />
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="panel p-4">
            <div className="skeleton h-2.5 w-20 mb-2" />
            <div className="skeleton h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="panel p-5 mb-6">
        <div className="skeleton h-2.5 w-28 mb-4" />
        <div className="skeleton h-24 w-full" />
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(secs) {
  if (!secs) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function countBy(arr, key) {
  const out = {};
  for (const item of arr) {
    const val = item[key] || "Unknown";
    out[val] = (out[val] || 0) + 1;
  }
  return out;
}

function sortedEntries(obj) {
  return Object.entries(obj).sort((a, b) => b[1] - a[1]);
}

function getTopKey(obj) {
  return sortedEntries(obj)[0]?.[0] || "—";
}

function getCountryCode(views, country) {
  return views.find(v => v.country === country)?.countryCode || "";
}

function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  const offset = 127397;
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "—";
  try {
    const ms = normalizeTimestamp(timestamp);
    if (!ms || isNaN(ms)) return "—";
    const diff = Date.now() - ms;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

