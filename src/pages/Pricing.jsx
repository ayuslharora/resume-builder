import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sun, Moon } from "lucide-react";
import { useRouteSeo } from "../seo/routeSeo";

const LANDING_HEADER_STYLE = {
  position: "sticky",
  top: 0,
  zIndex: 30,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: "color-mix(in oklch, var(--bg) 78%, transparent)",
};

function BrandLogo() {
  return (
    <>
      <div
        className="flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-[7px]"
        style={{
          boxShadow: "0 1px 2px rgba(15,23,42,.16)",
        }}
      >
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          className="h-full w-full"
        />
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">
        Resu<span className="serif italic font-normal">Me</span>
      </span>
    </>
  );
}

export default function Pricing() {
  useRouteSeo({
    title: "Pricing | ResuMe",
    description: "Most resume builders exist to suck your pockets dry. ResuMe is completely free. No paywalls, no subscriptions.",
    path: "/pricing",
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app-theme") || "light";
    }
    return "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    if (newTheme === "dark") {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }
  };

  const isDark = theme === "dark";

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }

    const bgColor = isDark ? "#0a0a0b" : "#ffffff";
    document.documentElement.style.backgroundColor = bgColor;
    document.body.style.backgroundColor = bgColor;
    return () => {
      document.documentElement.style.backgroundColor = "";
      document.body.style.backgroundColor = "";
    };
  }, [isDark]);

  const themeStyles = isDark
    ? {
        "--bg": "#0a0a0b",
        "--surface": "#18181b",
        "--surface-2": "#27272a",
        "--border": "#27272a",
        "--border-strong": "#3f3f46",
        "--text": "#ffffff",
        "--text-2": "#a1a1aa",
        "--muted": "#71717a",
        "--faint": "#52525b",
      }
    : {};

  return (
    <div
      className={`app-design min-h-screen bg-[var(--bg)] ${isDark ? "dark" : ""}`}
      style={{
        ...themeStyles,
        background: "var(--bg)",
        minHeight: "100%",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header className="border-b border-[var(--border)]" style={LANDING_HEADER_STYLE}>
        <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 24 }}>
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
          <nav className="hidden md:flex" style={{ gap: 22, marginLeft: 32 }}>
            <Link to="/" className="ulink text-[13.5px] text-[var(--text-2)]">Product</Link>
            <Link to="/templates" className="ulink text-[13.5px] text-[var(--text-2)]">Templates</Link>
            <Link to="/grader-info" className="ulink text-[13.5px] text-[var(--text-2)]">Grader</Link>
            <Link to="/pricing" className="ulink text-[13.5px] text-[var(--text)] font-medium">Pricing</Link>
          </nav>
          <span className="flex-1" />

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-strong)] text-[var(--text-2)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            
            <div className="h-4 w-px bg-[var(--border)] mx-1 hidden sm:block" />

            <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Start free</Link>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "64px 0" }}>
        <section className="container">
          <div className="text-center mb-16">
            <h1 className="h-display" style={{ fontSize: "clamp(48px, 6vw, 72px)", letterSpacing: "-0.04em", margin: 0, lineHeight: 1.05 }}>
              Fu*k pricing. <br className="hidden sm:block" />
              <span className="serif italic font-normal text-[var(--accent)]">This tool is on us.</span>
            </h1>
            
            <p style={{ color: "var(--text-2)", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6, marginTop: 32, maxWidth: 680, marginInline: "auto" }}>
              Most resume builders exist to suck your pockets dry. They let you build a full draft, and right when you click download—bam—they hit you with a paywall, wasting hours of your time. 
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The BS Builders Card */}
            <div className="panel p-8 md:p-10" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 24, opacity: 0.8 }}>
              <div className="mb-6">
                <h3 className="h-display text-2xl mb-2" style={{ color: "var(--text-2)" }}>Other Builders</h3>
                <div className="text-4xl font-bold line-through" style={{ color: "var(--muted)" }}>$29<span className="text-lg">/mo</span></div>
              </div>
              <ul className="space-y-4">
                {[
                  "Paywalls at download",
                  "Ugly watermarks on your PDF",
                  "Recurring monthly subscriptions",
                  "Templates locked behind 'Premium'",
                  "Wasting hours of your time"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[var(--text-2)]">
                    <span className="mt-1 text-[#f87171]">✕</span>
                    <span className="text-[15px]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ResuMe Card */}
            <div className="panel p-8 md:p-10 relative overflow-hidden" style={{ background: "linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)", border: "1px solid var(--accent)", borderRadius: 24, boxShadow: "0 20px 40px -20px color-mix(in oklch, var(--accent) 30%, transparent)" }}>
              <div className="absolute top-0 right-0 p-4">
                <div className="pill pill-accent text-[11px] font-bold uppercase tracking-wider" style={{ background: "var(--accent)", color: "var(--bg)" }}>The Disrupter</div>
              </div>
              <div className="mb-6">
                <h3 className="h-display text-2xl mb-2 text-[var(--text)]">ResuMe</h3>
                <div className="text-5xl font-bold text-[var(--accent)]">$0<span className="text-xl text-[var(--text-2)] font-normal"> unlocked</span></div>
              </div>
              <ul className="space-y-4">
                {[
                  "Unlimited, high-quality downloads",
                  "Zero watermarks, ever",
                  "No subscriptions. No credit cards.",
                  "Access to all ATS-optimized templates",
                  "AI Grader & Bullet Rewriter included"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-[var(--text)]">
                    <span className="mt-1 text-[var(--accent)]">✓</span>
                    <span className="text-[15px] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link to="/signup" className="btn btn-accent w-full justify-center btn-lg" style={{ fontSize: 16 }}>
                  Start building now <ArrowRight size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center mt-24">
             <h3 className="h-display text-3xl mb-6">Why we do it.</h3>
             <p className="text-[18px] text-[var(--text-2)] leading-relaxed">
               Job hunting is hard enough. You shouldn't have to pay to prove your worth. We don't use cheap tricks because we respect your time and ambition. We built this tool to level the playing field. No paywalls, no subscriptions, just pure value.
             </p>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 16, padding: "28px 24px", flexWrap: "wrap" }}>
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo />
          </Link>
          <span className="flex-1" />
          <span className="mono text-[12.5px] text-[var(--muted)]">
            ResuMe by Ayush · built with care ·{" "}
            <a
              href="https://Ayuslh.in"
              target="_blank"
              rel="noreferrer"
              className="ulink text-[var(--text-2)]"
            >
              Ayuslh.in
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
