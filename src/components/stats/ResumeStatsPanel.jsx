import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFirestore } from "../../hooks/useFirestore";
import {
  X, BarChart3, Eye, Globe, Monitor, Smartphone, Tablet,
  ExternalLink, TrendingUp, Clock, ArrowRight
} from "lucide-react";

/**
 * Slide-in side panel showing analytics for a specific resume.
 * Props:
 *   resumeId    — Firestore resume doc ID
 *   ownerId     — the resume owner's uid
 *   resumeTitle — display name
 *   onClose     — close callback
 *   showFullLink — if true, shows "Open full report" link (used from Export page)
 */
export default function ResumeStatsPanel({ resumeId, ownerId, resumeTitle, onClose, showFullLink = true }) {
  const { getResumeViewDetails } = useFirestore();
  const navigate = useNavigate();
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!resumeId || !ownerId) return;
    let cancelled = false;
    setLoading(true);
    getResumeViewDetails(resumeId, ownerId)
      .then((data) => { if (!cancelled) { setViews(data); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [resumeId, ownerId, getResumeViewDetails]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Derived stats
  const totalViews = views.length;
  const countryCounts = countBy(views, "country");
  const referrerCounts = countBy(views, "referrer");
  const deviceCounts = countBy(views, "device");
  const topCountries = sortedEntries(countryCounts).slice(0, 6);
  const topReferrers = sortedEntries(referrerCounts).slice(0, 5);
  const maxCountryCount = topCountries[0]?.[1] || 1;
  const recentViews = views.slice(0, 8);
  const mobileCount = deviceCounts["Mobile"] || 0;
  const desktopCount = deviceCounts["Desktop"] || 0;
  const tabletCount = deviceCounts["Tablet"] || 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="stats-panel-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        ref={panelRef}
        className="app-design stats-panel"
        role="dialog"
        aria-label="Resume analytics"
        aria-modal="true"
      >
        {/* Header */}
        <div className="stats-panel-header">
          <div className="flex items-center gap-2">
            <div className="stats-panel-icon">
              <BarChart3 size={14} />
            </div>
            <div>
              <div className="lbl-mono">Analytics</div>
              <div
                className="text-[13px] font-semibold text-[var(--text)] truncate max-w-[200px]"
                title={resumeTitle}
              >
                {resumeTitle || "Resume"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showFullLink && (
              <button
                onClick={() => { onClose?.(); navigate(`/stats/${resumeId}`); }}
                className="btn btn-outline btn-sm"
              >
                Full report <ArrowRight size={12} />
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ width: 28, padding: 0 }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="stats-panel-body">
          {loading ? (
            <StatsPanelSkeleton />
          ) : totalViews === 0 ? (
            <div className="stats-panel-empty">
              <Eye size={28} className="text-[var(--faint)]" />
              <p className="text-[13px] text-[var(--muted)] mt-2 text-center">
                No views yet.<br />Share your resume link to start tracking.
              </p>
            </div>
          ) : (
            <>
              {/* Top metrics row */}
              <div className="stats-metric-row">
                <StatMini label="Total views" value={totalViews} icon={<Eye size={13} />} />
                <StatMini label="Countries" value={Object.keys(countryCounts).filter(c => c !== "Unknown").length || "—"} icon={<Globe size={13} />} />
                <StatMini label="Top device" value={getTopKey(deviceCounts)} icon={<Monitor size={13} />} />
              </div>

              {/* Location bar chart */}
              {topCountries.length > 0 && (
                <section className="stats-section">
                  <h3 className="stats-section-title">
                    <Globe size={12} /> Locations
                  </h3>
                  <div className="stats-bar-list">
                    {topCountries.map(([country, count]) => (
                      <div key={country} className="stats-bar-row">
                        <div className="stats-bar-label">
                          <span className="stats-flag">{countryCodeToFlag(getCountryCode(views, country))}</span>
                          <span className="truncate">{country}</span>
                        </div>
                        <div className="stats-bar-track">
                          <div
                            className="stats-bar-fill"
                            style={{ width: `${Math.round((count / maxCountryCount) * 100)}%` }}
                          />
                        </div>
                        <span className="stats-bar-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Referrers */}
              {topReferrers.length > 0 && (
                <section className="stats-section">
                  <h3 className="stats-section-title">
                    <ExternalLink size={12} /> Traffic sources
                  </h3>
                  <div className="stats-tag-list">
                    {topReferrers.map(([referrer, count]) => (
                      <div key={referrer} className="stats-tag-row">
                        <span className="stats-tag-dot" />
                        <span className="flex-1 truncate text-[12.5px] text-[var(--text-2)]">{referrer}</span>
                        <span className="pill">{count}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Device split */}
              <section className="stats-section">
                <h3 className="stats-section-title">
                  <Monitor size={12} /> Devices
                </h3>
                <div className="stats-device-row">
                  <DeviceChip icon={<Monitor size={12} />} label="Desktop" count={desktopCount} total={totalViews} />
                  <DeviceChip icon={<Smartphone size={12} />} label="Mobile" count={mobileCount} total={totalViews} />
                  <DeviceChip icon={<Tablet size={12} />} label="Tablet" count={tabletCount} total={totalViews} />
                </div>
              </section>

              {/* Recent views */}
              {recentViews.length > 0 && (
                <section className="stats-section">
                  <h3 className="stats-section-title">
                    <Clock size={12} /> Recent views
                  </h3>
                  <div className="stats-recent-list">
                    {recentViews.map((view, i) => (
                      <div key={view.id || i} className="stats-recent-row">
                        <span className="stats-flag text-[15px]">{countryCodeToFlag(view.countryCode)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] text-[var(--text-2)] truncate">
                            {view.country !== "Unknown" ? view.city !== "Unknown" ? `${view.city}, ${view.country}` : view.country : "Unknown location"}
                          </div>
                          <div className="text-[11px] text-[var(--faint)]">{view.referrer} · {view.device}</div>
                        </div>
                        <span className="text-[11px] text-[var(--faint)] mono whitespace-nowrap">
                          {formatRelativeTime(view.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}

function StatMini({ label, value, icon }) {
  return (
    <div className="stats-mini-card">
      <div className="lbl-mono flex items-center gap-1">
        <span className="text-[var(--accent)]">{icon}</span>
        {label}
      </div>
      <div className="h-display text-[22px] text-[var(--text)] mt-1">{value}</div>
    </div>
  );
}

function DeviceChip({ icon, label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="stats-device-chip">
      <div className="flex items-center gap-1.5 text-[var(--muted)]">
        {icon}
        <span className="text-[11.5px] font-medium text-[var(--text-2)]">{label}</span>
      </div>
      <div className="h-display text-[18px] text-[var(--text)]">{count}</div>
      <div className="text-[10.5px] text-[var(--faint)] mono">{pct}%</div>
    </div>
  );
}

function StatsPanelSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="grid grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="panel p-3">
            <div className="skeleton h-2.5 w-16 mb-2" />
            <div className="skeleton h-6 w-10" />
          </div>
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="panel p-4">
          <div className="skeleton h-2.5 w-20 mb-3" />
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex items-center gap-2 mb-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton flex-1 h-2" />
              <div className="skeleton h-3 w-6" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

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
  const entries = sortedEntries(obj);
  return entries[0]?.[0] || "—";
}

function getCountryCode(views, country) {
  const match = views.find(v => v.country === country);
  return match?.countryCode || "";
}

function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  const offset = 127397; // Unicode flag offset
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
}

function formatRelativeTime(timestamp) {
  if (!timestamp) return "—";
  try {
    const ms = timestamp?.seconds ? timestamp.seconds * 1000 : Number(timestamp);
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
