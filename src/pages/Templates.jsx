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

const TEMPLATES = [
  {
    id: "minimal",
    name: "Minimal",
    desc: "Cut the bullshit. The Minimal template strips away distractions and forces recruiters to focus on what actually matters: your raw impact. Perfect for traditional industries.",
    image: "/templates/minimal.png",
  },
  {
    id: "modern",
    name: "Modern",
    desc: "Bold, confident, and impossible to ignore. Uses sharp typography and accent colors to highlight your biggest wins. Built for tech, marketing, and the modern corporate world.",
    image: "/templates/modern.png",
  },
  {
    id: "professional",
    name: "Professional",
    desc: "The classic corporate powerhouse. Highly ATS-optimized to sail through the filters while remaining perfectly readable for human eyes. The gold standard for finance and consulting.",
    image: "/templates/professional.png",
  },
  {
    id: "creative",
    name: "Creative",
    desc: "Break the rules, but keep it clean. Asymmetrical layouts and vibrant contrast designed for creatives, designers, and anyone who wants to drop the corporate mask.",
    image: "/templates/creative.png",
  },
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

export default function Templates() {
  useRouteSeo({
    title: "Resume Templates | ResuMe",
    description: "Browse our collection of ATS-optimized resume templates. Minimal, Modern, Professional, and Creative designs tailored to get you hired.",
    path: "/templates",
    // Reusing the general json-ld is fine for now or omitted
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
            <Link to="/templates" className="ulink text-[13.5px] text-[var(--text)] font-medium">Templates</Link>
            <Link to="/grader-info" className="ulink text-[13.5px] text-[var(--text-2)]">Grader</Link>
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
              Stop blending into the pile. <br />
              <span className="serif italic font-normal text-[var(--accent)]">Stand out instantly.</span>
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: "var(--text-2)", marginTop: 24, maxWidth: 640 }}>
              Most basic templates look like they were built in 2004. Paid templates charge you $15 just to download your own data. We give you premium, ATS-optimized designs that actually impress recruiters—totally on the house.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 64 }}>
            {TEMPLATES.map((template, index) => (
              <div
                key={template.id}
                style={{
                  display: "flex",
                  flexDirection: index % 2 === 1 ? "row-reverse" : "row",
                  gap: 48,
                  alignItems: "center",
                  flexWrap: "wrap"
                }}
                className="template-row"
              >
                <div style={{ flex: "1 1 400px" }}>
                  <div className="panel lift bg-[var(--surface)] p-4 md:p-6" style={{ borderRadius: 16 }}>
                    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white p-4">
                      <img
                        src={template.image}
                        alt={`${template.name} resume template preview`}
                        className="h-full w-full object-contain"
                        loading="lazy"
                        style={{ maxHeight: 600 }}
                      />
                    </div>
                  </div>
                </div>
                <div style={{ flex: "1 1 300px" }}>
                  <div className="lbl-mono" style={{ marginBottom: 12 }}>0{index + 1}</div>
                  <h2 className="h-display" style={{ fontSize: 36, letterSpacing: "-0.025em", margin: 0 }}>
                    {template.name}
                  </h2>
                  <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-2)", marginTop: 16 }}>
                    {template.desc}
                  </p>
                  <div style={{ marginTop: 32 }}>
                    <Link to="/signup" className="btn btn-outline">
                      Use this template <ArrowRight size={15} className="ml-1.5" />
                    </Link>
                  </div>
                </div>
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
              Stop getting extorted for a PDF. <br className="hidden sm:block" />
              <span className="serif italic font-normal text-[var(--accent)]">Build yours now.</span>
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: "clamp(16px, 2vw, 18px)", marginTop: 18, marginBottom: 32, maxWidth: 540, marginInline: "auto" }}>
              Don't spend hours on a draft just to hit a paywall. Start building right now, with full access to all templates, totally on the house.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/signup" className="btn btn-accent btn-lg font-bold" style={{ padding: "0 32px" }}>Start building now <ArrowRight size={15} className="ml-1.5" /></Link>
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
