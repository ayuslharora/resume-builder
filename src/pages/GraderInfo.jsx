import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sun, Moon, Eye, Layers, Key, PencilLine } from "lucide-react";
import { useRouteSeo } from "../seo/routeSeo";

const LANDING_HEADER_STYLE = {
  position: "sticky",
  top: 0,
  zIndex: 30,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: "color-mix(in oklch, var(--bg) 78%, transparent)",
};

const GRADER_FEATURES = [
  {
    title: "Simulate the Gatekeepers",
    desc: "Most graders use one generic algorithm. We let you switch the lens to simulate a ruthless ATS scanner, a busy HR recruiter, or a technical hiring manager.",
    icon: Eye
  },
  {
    title: "A/B Test Your Career",
    desc: "Applying for multiple roles? Input your primary target and up to two alternates. We'll score you against all three so you don't have to guess where you fit best.",
    icon: Layers
  },
  {
    title: "No More Keyword Stuffing",
    desc: "We don't just dump a list of missing words. We tell you exactly which section needs them, explain how to weave them in naturally, and give you examples.",
    icon: Key
  },
  {
    title: "Turn Fluff Into Impact",
    desc: "Flag weak, generic bullets. Understand exactly why they fail, and let our AI instantly generate stronger, data-driven alternatives you can apply in one click.",
    icon: PencilLine
  }
];

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

export default function GraderInfo() {
  useRouteSeo({
    title: "ATS Resume Grader Features | ResuMe",
    description: "Discover how ResuMe's ATS grader analyzes your resume from multiple perspectives, rewrites weak bullets, and compares alternate roles.",
    path: "/grader-info",
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
            <Link to="/grader-info" className="ulink text-[13.5px] text-[var(--text)] font-medium">Grader</Link>
            <Link to="/pricing" className="ulink text-[13.5px] text-[var(--text-2)]">Pricing</Link>
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
            <Link to="/signup" className="btn btn-primary btn-sm">Get started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container" style={{ paddingTop: 88, paddingBottom: 64 }}>
          <div style={{ maxWidth: 720, marginBottom: 56 }}>
            <h1 className="h-display" style={{ fontSize: "clamp(40px, 5vw, 64px)", lineHeight: 1.05, margin: 0, letterSpacing: "-0.035em" }}>
              Other graders give you a score. <br />
              <span className="serif italic font-normal text-[var(--accent)]">We give you the answers.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--text-2)", marginTop: 24, maxWidth: 640 }}>
              Most tools slap a "45/100" on your resume and demand $20 to tell you why. That's bullshit. We built an engine that reads your resume like a recruiter, tells you exactly what's missing, and rewrites your weak points instantly.
            </p>
            <div style={{ marginTop: 32, display: "flex", gap: 16 }}>
              <Link to="/grader" className="btn btn-accent btn-lg">Audit my resume <ArrowRight size={15} className="ml-1.5" /></Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            {GRADER_FEATURES.map((feature, i) => (
              <div key={i} className="panel lift bg-[var(--surface)] p-8" style={{ borderRadius: 16, border: "1px solid var(--border)" }}>
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <feature.icon size={24} />
                </div>
                <h3 className="m-0 text-[20px] font-semibold">{feature.title}</h3>
                <p className="mt-3 text-[15px] lineHeight-[1.6] text-[var(--text-2)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="container" style={{ paddingBottom: 96, paddingTop: 48 }}>
          <div
            style={{
              borderRadius: 18,
              padding: "56px 48px",
              background: "linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)",
              border: "1px solid var(--border)",
              textAlign: "center",
            }}
          >
            <h2 className="h-display" style={{ fontSize: "clamp(36px, 5vw, 48px)", letterSpacing: "-0.03em", margin: 0, lineHeight: 1.05 }}>
              Stop getting rejected by robots. <br className="hidden sm:block" />
              <span className="serif italic font-normal text-[var(--accent)]">Beat the gatekeepers.</span>
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: "clamp(16px, 2vw, 18px)", marginTop: 18, marginBottom: 32, maxWidth: 540, marginInline: "auto" }}>
              Stop blindly applying and hoping for the best. Upload your resume and let our engine rip it apart before a real recruiter does.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/grader" className="btn btn-accent btn-lg font-bold" style={{ padding: "0 32px" }}>Grade my resume <ArrowRight size={15} className="ml-1.5" /></Link>
            </div>
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
