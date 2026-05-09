import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Download,
  FileText,
  LayoutTemplate,
  PencilLine,
  Shield,
  Sparkles,
  Target,
  Zap,
  Sun,
  Moon,
  Eye,
  Layers,
  Key,
} from "lucide-react";
import {
  HOME_JSON_LD,
  HOME_DESCRIPTION,
  HOME_TITLE,
  useRouteSeo,
} from "../seo/routeSeo";
import {
  HOME_LANDING_FEATURES,
  HOME_LANDING_METRICS,
  HOME_SEO_BADGE,
  HOME_SEO_DESCRIPTION,
  HOME_SEO_CITABLE_BLOCKS,
  HOME_SEO_FAQ,
  HOME_SEO_TITLE,
  HOME_SEO_TRUST,
  HOME_TARGET_COMPANIES,
  HOME_TEMPLATE_PREVIEWS,
} from "../seo/homepageSeoContent";

const FEATURE_ICON_MAP = {
  "AI builder": Sparkles,
  "ATS grader": Target,
  "Four templates": LayoutTemplate,
  "Inline editor": PencilLine,
  "Targeted rewrites": Zap,
  "PDF and DOCX": Download,
};

const HERO_SCORE_ITEMS = [
  ["Formatting", 92],
  ["Keywords", 78],
  ["Impact", 88],
  ["Clarity", 91],
];

const HERO_BULLETS = [
  "Owned onboarding redesign, raising activation by 18%.",
  "Built component kit used by 9 product teams.",
  "Trimmed dashboard TTI from 4.2s to 1.3s.",
];

const HERO_SKILLS = ["TypeScript", "React", "Next.js", "GraphQL", "Tailwind", "Vite"];

const LANDING_HEADER_STYLE = {
  position: "sticky",
  top: 0,
  zIndex: 30,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  background: "color-mix(in oklch, var(--bg) 78%, transparent)",
};

const LANDING_LAYOUT_CSS = `
  .landing-hero-grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center; }
  @media (max-width: 1024px) {
    .landing-hero-grid { grid-template-columns: 1fr; gap: 48px; }
    .landing-hero-grid .landing-hero-visual-wrap { max-width: 560px; margin-left: 0; }
  }
  .landing-features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; }
  @media (max-width: 900px) { .landing-features-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 600px) { .landing-features-grid { grid-template-columns: 1fr; } }
  .landing-templates-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  @media (max-width: 900px) { .landing-templates-grid { grid-template-columns: repeat(2, 1fr); } }
  .landing-metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
  @media (max-width: 700px) { .landing-metric-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
`;

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

export default function Landing() {
  useRouteSeo({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
    jsonLd: HOME_JSON_LD,
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
        color: "var(--text)"
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
        <section id="product" className="container" style={{ paddingTop: 88, paddingBottom: 96 }}>
          <style>{LANDING_LAYOUT_CSS}</style>
          <div className="landing-hero-grid">
            <div>
              <h1
                className="h-display"
                style={{ fontSize: "clamp(40px, 5.6vw, 72px)", lineHeight: 1.02, margin: 0, letterSpacing: "-0.035em" }}
              >
                {HOME_SEO_TITLE}{" "}
                <span className="serif italic font-normal text-[var(--accent)]">with ATS grading.</span>
              </h1>
              <p style={{ fontSize: 17.5, lineHeight: 1.55, color: "var(--text-2)", marginTop: 22, maxWidth: 540 }}>
                {HOME_SEO_DESCRIPTION}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap" }}>
                <Link to="/signup" className="btn btn-accent btn-lg">
                  Start building now <ArrowRight size={15} />
                </Link>
                <Link to="/grader" className="btn btn-outline btn-lg">
                  Grade my resume
                </Link>
              </div>
              <div style={{ marginTop: 28, display: "flex", gap: 22, color: "var(--muted)", fontSize: 12.5, flexWrap: "wrap" }}>
                {HOME_SEO_TRUST.map((label) => {
                  const iconMap = {
                    "ATS Compliant": Shield,
                    "AI-Powered": Zap,
                    "Pro Templates": FileText,
                  };
                  const IconComponent = iconMap[label];
                  return (
                    <span key={label} className="inline-flex items-center gap-1.5">
                      <IconComponent size={13} className="text-[var(--accent)]" />
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="landing-hero-visual-wrap"><HeroVisual /></div>
          </div>
        </section>

        <section style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
          <div className="container landing-company-row" style={{ display: "flex", alignItems: "center", gap: 36, padding: "20px 24px", overflow: "hidden" }}>
            <span className="lbl-mono" style={{ flexShrink: 0 }}>Trusted by candidates targeting roles at</span>
            <div
              className="landing-company-ticker"
              aria-label={`Companies candidates target: ${HOME_TARGET_COMPANIES.join(", ")}`}
            >
              <div className="landing-company-track" aria-hidden="true">
                {[0, 1].map((segmentIndex) => (
                  <div className="landing-company-segment" key={segmentIndex}>
                    {HOME_TARGET_COMPANIES.map((company) => (
                      <span key={`${segmentIndex}-${company}`}>{company}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="container" style={{ paddingTop: 96, paddingBottom: 64 }} aria-labelledby="features-heading">
          <div style={{ maxWidth: 720, marginBottom: 56 }}>
            <div className="lbl-mono" style={{ marginBottom: 12 }}>What you get</div>
            <h2 id="features-heading" className="h-display" style={{ fontSize: 40, letterSpacing: "-0.025em", margin: 0, lineHeight: 1.1 }}>Every step of the resume, sharpened.</h2>
          </div>
          <div className="landing-features-grid" style={{ background: "var(--border)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            {HOME_LANDING_FEATURES.map((section) => (
              <FeatureCard key={section.title} section={section} />
            ))}
          </div>
        </section>

        <section className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>
          <div className="panel landing-metric-grid" style={{ padding: 32 }}>
            {HOME_LANDING_METRICS.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </div>
        </section>

        <section id="templates" className="container" style={{ paddingTop: 64, paddingBottom: 96 }} aria-labelledby="templates-heading">
          <div style={{ display: "flex", alignItems: "end", gap: 24, marginBottom: 32, flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div className="lbl-mono" style={{ marginBottom: 12 }}>Templates</div>
              <h2 id="templates-heading" className="h-display" style={{ fontSize: 36, letterSpacing: "-0.025em", margin: 0 }}>Pick a starting point. Switch any time.</h2>
            </div>
            <Link to="/templates" className="btn btn-outline">Browse all</Link>
          </div>
          <div className="landing-templates-grid">
            {HOME_TEMPLATE_PREVIEWS.map((template, index) => (
              <TemplateCard key={template.id} template={template} index={index} />
            ))}
          </div>
        </section>

        <SeoOnlyContent />

        <section id="pricing" className="container" style={{ paddingBottom: 96 }}>
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
              Stop applying into a black hole. <br className="hidden sm:block" />
              <span className="serif italic font-normal text-[var(--accent)]">Start landing interviews.</span>
            </h2>
            <p style={{ color: "var(--text-2)", fontSize: "clamp(16px, 2vw, 18px)", marginTop: 18, marginBottom: 32, maxWidth: 540, marginInline: "auto" }}>
              We built the ultimate engine to get you past the bots and in front of human gatekeepers. No paywalls, no BS. Just a resume that actually works.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              <Link to="/signup" className="btn btn-accent btn-lg font-bold" style={{ padding: "0 32px" }}>Build your resume now <ArrowRight size={15} className="ml-1.5" /></Link>
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
            ResuMe by Ayush ·{" "}
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

function HeroVisual() {
  return (
    <div style={{ position: "relative", aspectRatio: "1.05", maxWidth: 560, marginLeft: "auto", minWidth: 0 }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--border-strong) 60%, transparent) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
      <div
        className="paper"
        style={{
          position: "absolute",
          left: "8%",
          top: "8%",
          width: "62%",
          aspectRatio: "0.78",
          borderRadius: 8,
          padding: "24px 22px",
          fontSize: 11,
          lineHeight: 1.45,
          transform: "rotate(-2.5deg)",
        }}
      >
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, letterSpacing: "-.01em" }}>Aarav Mehta</div>
        <div style={{ color: "#71717a", fontSize: 10, marginTop: 2 }}>Senior Frontend · aarav@mehta.dev · Bengaluru</div>
        <div style={{ height: 1, background: "#ececef", margin: "12px 0 10px" }} />
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>Experience</div>
        <div style={{ fontWeight: 600, fontSize: 11 }}>Razorpay · Senior Frontend</div>
        <div style={{ color: "#71717a", fontSize: 9, marginBottom: 4 }}>Aug 2022 - Present</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 10, lineHeight: 1.45, color: "#27272a" }}>
          {HERO_BULLETS.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--accent)", marginTop: 10, marginBottom: 4 }}>Skills</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {HERO_SKILLS.map((skill) => (
            <span key={skill} style={{ fontSize: 9, padding: "2px 6px", background: "#f4f4f5", borderRadius: 3 }}>{skill}</span>
          ))}
        </div>
      </div>
      <div
        className="grader-hero-widget"
        style={{
          position: "absolute",
          right: "4%",
          top: "32%",
          width: "52%",
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: 18,
          boxShadow: "var(--shadow-lg)",
          transform: "rotate(2deg)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <span className="lbl-mono">ATS Grade</span>
          <span className="pill pill-good"><span className="dot" style={{ background: "currentColor" }} />Strong</span>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="h-display" style={{ fontSize: 56, letterSpacing: "-0.04em", lineHeight: 1 }}>87</span>
          <span style={{ color: "var(--muted)", fontSize: 16 }}>/100</span>
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {HERO_SCORE_ITEMS.map(([label, value]) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: "var(--text-2)" }}>{label}</span>
                <span className="mono" style={{ color: "var(--muted)" }}>{value}</span>
              </div>
              <div className="scorebar"><i style={{ width: `${value}%` }} /></div>
            </div>
          ))}
        </div>
        <div
          className="hidden sm:flex"
          style={{
            position: "absolute",
            left: "-20px",
            bottom: "-20px",
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "10px 14px",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transform: "rotate(-2deg)"
          }}
        >
          <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={14} />
          </span>
          <span>
            <span style={{ display: "block", fontSize: 12, fontWeight: 500 }}>Rewrote 3 bullets</span>
            <span style={{ display: "block", fontSize: 10.5, color: "var(--muted)" }}>+12 impact score</span>
          </span>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ section }) {
  const IconComponent = FEATURE_ICON_MAP[section.title] || Sparkles;

  return (
    <article className="bg-[var(--bg)] p-7">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
        <IconComponent size={16} />
      </div>
      <h3 className="m-0 text-base font-semibold">{section.title}</h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">{section.body}</p>
    </article>
  );
}

function MetricCard({ metric }) {
  return (
    <div>
      <div className="h-display text-[40px] leading-none">
        {metric.value}
        {metric.suffix ? <span className="text-[22px] text-[var(--muted)]">{metric.suffix}</span> : null}
      </div>
      <div className="mt-1.5 text-[12.5px] text-[var(--muted)]">{metric.label}</div>
    </div>
  );
}

function TemplateCard({ template, index }) {
  return (
    <article className="panel lift bg-[var(--surface)] p-3.5">
      <div className="mb-3 aspect-[0.75] overflow-hidden rounded-md border border-[var(--border)] bg-white p-3.5">
        <img
          src={template.image}
          alt={`${template.name} resume template preview`}
          className="h-full w-full rounded-sm object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="m-0 text-sm font-semibold">{template.name}</h3>
        <span className="lbl-mono text-[10px]">0{index + 1}</span>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">{template.desc}</p>
    </article>
  );
}

function SeoOnlyContent() {
  return (
    <section className="sr-only" aria-label="ResuMe public search answers">
      {HOME_SEO_CITABLE_BLOCKS.map((block) => (
        <article key={block.heading}>
          <h2>{block.heading}</h2>
          <p>{block.body}</p>
        </article>
      ))}
      {HOME_SEO_FAQ.map((item) => (
        <article key={item.question}>
          <h2>{item.question}</h2>
          <p>{item.answer}</p>
        </article>
      ))}
    </section>
  );
}
// );
// }
