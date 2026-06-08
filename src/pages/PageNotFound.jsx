import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";
import PublicHeader from "../components/layout/PublicHeader";
import { useAuth } from "../context/useAuth";

function GithubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const CSS = `
  @keyframes nf-left {
    from { opacity: 0; transform: translateX(-50px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes nf-up {
    from { opacity: 0; transform: translateY(50px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes nf-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-15px); }
  }
  .nf-text   { animation: nf-left 0.8s ease-out forwards; }
  .nf-illus  { animation: nf-up 1s 0.2s ease-out both; }
  .nf-footer { animation: nf-up 0.8s 0.6s ease-out both; }
  .nf-float  { animation: nf-float 6s ease-in-out infinite; }
  .nf-social-link {
    color: var(--muted);
    transition: color 0.2s, transform 0.2s;
    display: flex; align-items: center;
  }
  .nf-social-link:hover { color: var(--text); transform: scale(1.12); }
`;

export default function PageNotFound() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app-theme") || "light";
    }
    return "light";
  });

  const isDark = theme === "dark";

  const toggleTheme = () => {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("app-theme", next);
    if (next === "dark") {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }
  };

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute("data-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
    }
    const bg = isDark ? "#0a0a0b" : "#f8fafc";
    document.documentElement.style.backgroundColor = bg;
    document.body.style.backgroundColor = bg;
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
    : { "--bg": "#f8fafc" };

  return (
    <div
      className={`app-design min-h-screen ${isDark ? "dark" : ""}`}
      style={{
        ...themeStyles,
        background: "var(--bg)",
        color: "var(--text)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <style>{CSS}</style>

      <PublicHeader isDark={isDark} toggleTheme={toggleTheme} currentUser={currentUser} />

      <main
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "64px 24px 100px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
          flexWrap: "wrap-reverse",
        }}
      >
        {/* Left — text */}
        <div
          className="nf-text"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            zIndex: 20,
            minWidth: 260,
          }}
        >
          <h1
            style={{
              fontSize: "clamp(6rem, 12vw, 11rem)",
              lineHeight: 0.85,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: "var(--text)",
              margin: 0,
            }}
          >
            404
          </h1>

          <h2
            style={{
              fontSize: "clamp(1.1rem, 2.4vw, 1.4rem)",
              fontWeight: 800,
              letterSpacing: "0.03em",
              textTransform: "uppercase",
              marginTop: 14,
              color: "var(--text)",
            }}
          >
            Page not found.
          </h2>

          <p style={{ marginTop: 14, color: "var(--muted)", fontSize: 15, fontWeight: 500 }}>
            The page you&apos;re looking for doesn&apos;t exist.
          </p>

          <button
            onClick={() => navigate("/")}
            className="btn btn-accent btn-lg"
            style={{ marginTop: 32, cursor: "pointer" }}
          >
            <ArrowLeft size={15} />
            Go home
          </button>
        </div>

        {/* Right — illustration */}
        <div className="nf-illus nf-float" style={{ width: "100%", maxWidth: 420, flexShrink: 0 }}>
          <img
            src="/not-found-illustration.svg"
            alt="404 illustration — page not found"
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              filter: isDark
                ? "brightness(0) saturate(100%) invert(1)"
                : "brightness(0) saturate(100%)",
            }}
          />
        </div>
      </main>

      {/* Social footer */}
      <div
        className="nf-footer"
        style={{
          position: "absolute",
          bottom: 24,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 14,
          zIndex: 20,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "var(--faint)",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          ResuMe · Open source under MIT
        </p>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="https://www.linkedin.com/in/ayuslh/" target="_blank" rel="noreferrer" className="nf-social-link" aria-label="LinkedIn">
            <LinkedinIcon />
          </a>
          <a href="https://github.com/ayuslharora" target="_blank" rel="noreferrer" className="nf-social-link" aria-label="GitHub">
            <GithubIcon />
          </a>
          <a href="https://Ayuslh.in" target="_blank" rel="noreferrer" className="nf-social-link" aria-label="Portfolio">
            <Globe size={20} />
          </a>
        </div>
      </div>
    </div>
  );
}
