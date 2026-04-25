import { Link } from "react-router-dom";
import { FileText, ArrowRight, Sparkles, Shield, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 fade-in relative overflow-hidden">

      {/* ── Decorative background orbs ── */}
      <div className="orb w-[600px] h-[600px] bg-cyan-500/10 -top-64 -left-48 animate-float-slow" />
      <div className="orb w-[500px] h-[500px] bg-purple-600/8 -bottom-48 -right-48 animate-float-medium" style={{ animationDelay: "-3s" }} />
      <div className="orb w-[300px] h-[300px] bg-cyan-400/6 top-1/3 right-1/4 animate-pulse-glow" style={{ animationDelay: "-1.5s" }} />
      <div className="orb w-[200px] h-[200px] bg-indigo-500/8 bottom-1/3 left-1/4 animate-float-fast" style={{ animationDelay: "-2s" }} />

      {/* ── Hero section ── */}
      <div className="max-w-3xl w-full text-center space-y-8 mb-16 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest mb-4"
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

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-on-surface leading-tight">
          Craft{" "}
          <span style={{
            background: "linear-gradient(135deg, #06b6d4 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 20px rgba(6,182,212,0.4))"
          }}>
            Perfect Resumes
          </span>
          <br className="hidden sm:block" /> with AI precision.
        </h1>

        <p className="text-lg sm:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Transform your raw experience into tailored, professional resumes that pass the ATS filters and land interviews.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
        <div className="flex items-center justify-center gap-8 pt-2 flex-wrap">
          {[
            { icon: Shield, label: "ATS Compliant" },
            { icon: Zap, label: "AI-Powered" },
            { icon: FileText, label: "Pro Templates" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <Icon size={13} className="text-primary" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature card ── */}
      <div
        className="w-full max-w-4xl rounded-2xl p-8 sm:p-10 flex flex-col md:flex-row items-center gap-8 justify-between relative z-10"
        style={{
          background: "rgba(25, 31, 49, 0.5)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
        }}
      >
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.04) 0%, transparent 60%)" }} />

        <div className="flex-1 text-center md:text-left space-y-2 relative">
          <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 rounded-md text-xs font-bold"
            style={{ background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.15)" }}>
            FREE TOOL
          </div>
          <h3 className="text-xl font-bold text-on-surface flex items-center justify-center md:justify-start gap-2">
            <FileText className="text-primary" size={22} />
            Resume Grader
          </h3>
          <p className="text-on-surface-variant text-sm max-w-md mx-auto md:mx-0 leading-relaxed">
            Upload your existing PDF or DOCX resume for instant AI-powered feedback on content, formatting, and ATS compatibility.
          </p>
        </div>

        <Link
          to="/grader"
          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-on-surface transition-all duration-200 w-full md:w-auto justify-center relative"
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
    </div>
  );
}
