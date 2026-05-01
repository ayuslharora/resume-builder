import { Link } from "react-router-dom";
import { FileText, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

export default function Landing() {
  const creditItems = [
    "Built and designed by Ayush",
    "Ayuslh.in",
    "Built and designed by Ayush",
    "Ayuslh.in",
    "Built and designed by Ayush",
    "Ayuslh.in",
  ];

  return (
    <div className="landing-desktop-shell min-h-screen px-6 pt-6 pb-24 fade-in relative overflow-hidden">

      {/* ── Decorative background orbs ── */}
      <div className="orb w-[600px] h-[600px] bg-cyan-500/10 -top-64 -left-48 animate-float-slow" />
      <div className="orb w-[500px] h-[500px] bg-blue-600/8 -bottom-48 -right-48 animate-float-medium" style={{ animationDelay: "-3s" }} />
      <div className="orb w-[300px] h-[300px] bg-cyan-400/6 top-1/3 right-1/4 animate-pulse-glow" style={{ animationDelay: "-1.5s" }} />
      <div className="orb w-[200px] h-[200px] bg-blue-500/8 bottom-1/3 left-1/4 animate-float-fast" style={{ animationDelay: "-2s" }} />

      <div className="landing-hero-grid w-full max-w-7xl relative z-10">
        {/* ── Hero section ── */}
        <section className="w-full space-y-5 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
            style={{
              background: "rgba(6, 182, 212, 0.08)",
              borderColor: "rgba(6, 182, 212, 0.2)",
              color: "#06b6d4",
              backdropFilter: "blur(8px)",
              boxShadow: "0 0 16px rgba(6,182,212,0.15)"
            }}>
            <Sparkles size={12} />
            ATS-Optimized Resumes
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.02]">
            Craft{" "}
            <span style={{
              background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 20px rgba(6,182,212,0.4))"
            }}>
              Perfect Resumes
            </span>
            <br className="hidden xl:block" /> with AI precision.
          </h1>

          <p className="text-base sm:text-lg xl:text-[1.08rem] text-on-surface-variant max-w-xl leading-relaxed">
            Transform your raw experience into tailored, professional resumes that pass ATS filters and land interviews.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="w-full sm:w-auto btn-primary px-8 py-3.5 text-base"
            >
              Start Building Free <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto btn-ghost px-8 py-3.5 text-base text-on-surface"
            >
              Log In
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-5 pt-1 flex-wrap">
            {[
              { icon: Shield, label: "ATS Compliant" },
              { icon: Zap, label: "AI-Powered" },
              { icon: FileText, label: "Pro Templates" },
            ].map((item) => {
              const IconComponent = item.icon;

              return (
                <div key={item.label} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <IconComponent size={13} className="text-primary" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Feature card ── */}
        <aside
          className="landing-feature-panel w-full max-w-[440px] rounded-[1.5rem] p-5.5 xl:p-6 relative"
          style={{
            background: "rgba(19, 29, 48, 0.62)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 18px 48px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)"
          }}
        >
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ background: "linear-gradient(145deg, rgba(6,182,212,0.08) 0%, transparent 58%, rgba(59,130,246,0.08) 100%)" }} />

          <div className="relative space-y-3.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold"
              style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.15)" }}>
              FREE TOOL
            </div>
            <div className="space-y-2.5">
              <h3 className="text-2xl xl:text-[1.7rem] font-bold text-on-surface flex items-center gap-2">
                <FileText className="text-primary" size={24} />
                Resume Grader
              </h3>
              <p className="text-on-surface-variant text-[0.95rem] leading-relaxed max-w-md">
                Turn any uploaded resume into a scored, ATS-aware report with clear fixes you can act on in minutes.
              </p>
            </div>

            <div
              className="landing-feature-preview rounded-2xl p-3 space-y-2.5"
              style={{
                background: "rgba(8, 15, 31, 0.72)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"
              }}
            >
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                <span>Live Analysis Preview</span>
                <span className="text-primary">82 / 100</span>
              </div>
              <div className="h-2 rounded-full bg-white/6 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: "82%", background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)" }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-sm">
                <div className="rounded-xl px-3 py-2 bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-on-surface font-semibold">Keywords</p>
                  <p className="text-on-surface-variant text-xs mt-1">Strong role alignment</p>
                </div>
                <div className="rounded-xl px-3 py-2 bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-on-surface font-semibold">Formatting</p>
                  <p className="text-on-surface-variant text-xs mt-1">ATS-safe structure</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                "Tailored rewrite suggestions",
                "Keyword match signals",
                "Layout and ATS checks",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 bg-white/[0.03] border border-white/[0.06]"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: "linear-gradient(180deg, #22d3ee 0%, #3b82f6 100%)", boxShadow: "0 0 12px rgba(34,211,238,0.5)" }}
                  />
                  <span className="text-sm text-on-surface">{item}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-on-surface-variant">
              <span>PDF/DOCX</span>
              <span>•</span>
              <span>Instant Feedback</span>
              <span>•</span>
              <span>ATS Checks</span>
            </div>

            <Link
              to="/grader"
              className="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-on-surface transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(8px)"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "rgba(6,182,212,0.35)";
                e.currentTarget.style.boxShadow = "0 0 16px rgba(6,182,212,0.15)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Grade My Resume <ArrowRight size={15} />
            </Link>
          </div>
        </aside>
      </div>

      <div className="landing-credit-marquee">
        <div className="landing-credit-track">
          {creditItems.map((item, index) => (
            <span key={`credit-a-${index}`} className="landing-credit-item">
              {item === "Ayuslh.in" ? (
                <a
                  href="https://Ayuslh.in"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {item}
                </a>
              ) : (
                <span>{item}</span>
              )}
              <span className="landing-credit-separator">•</span>
            </span>
          ))}
          {creditItems.map((item, index) => (
            <span key={`credit-b-${index}`} className="landing-credit-item">
              {item === "Ayuslh.in" ? (
                <a
                  href="https://Ayuslh.in"
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  {item}
                </a>
              ) : (
                <span>{item}</span>
              )}
              <span className="landing-credit-separator">•</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
