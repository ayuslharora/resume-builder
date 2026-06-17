import { useState, useEffect } from "react";
import { useRouteSeo } from "../seo/routeSeo";
import PublicFooter from "../components/layout/PublicFooter";
import PublicHeader from "../components/layout/PublicHeader";
import { useAuth } from "../context/useAuth";

const SECTIONS = [
  {
    title: "What we collect",
    body: [
      "**Account information** — When you sign up, we store your email address and a display name via Firebase Authentication.",
      "**Resume content** — Everything you type into your resume (name, phone, work history, skills, etc.) is stored in Firestore under your account so you can access it across devices.",
      "**AI task input** — When you use AI features (bullet rewrites, ATS grading, cover letters), the relevant sections of your resume are sent to Groq's API to generate a response. We do not store these requests beyond what Firestore already holds.",
      "**Shared resume links** — If you generate a public share link, the resume snapshot is readable by anyone with the link. You can revoke the link at any time from the Builder.",
      "**Contact form submissions** — Messages sent via the Contact page are processed by Formspree and delivered to us by email. We do not store them in our own database.",
      "**Page-view analytics** — We use Vercel Analytics to count page views and basic browser metadata (browser type, country). No cookies are set for this. No personal data is tied to these events.",
    ],
  },
  {
    title: "What we don't collect",
    body: [
      "We do not sell your data.",
      "We do not use your resume content for advertising.",
      "We do not run third-party ad trackers or retargeting pixels.",
      "We do not read your resume content for any purpose other than returning it to you and powering the AI features you explicitly invoke.",
    ],
  },
  {
    title: "How we use your data",
    body: [
      "To show you your resumes across sessions and devices.",
      "To run AI features you trigger (grading, rewrites, cover letters). Your content is sent to Groq only when you click the relevant button.",
      "To count anonymous page-view metrics so we know which features are used.",
      "To respond to messages you send us through the Contact page.",
    ],
  },
  {
    title: "Third-party services",
    body: [
      "**Firebase (Google)** — Authentication and database. Subject to Google's privacy policy.",
      "**Groq** — AI inference. Resume content is sent to Groq only when you use an AI feature. Subject to Groq's privacy policy.",
      "**Vercel** — Hosting and analytics. Anonymous page-view data only. Subject to Vercel's privacy policy.",
      "**Formspree** — Contact form processing. Subject to Formspree's privacy policy.",
    ],
  },
  {
    title: "Data retention and deletion",
    body: [
      "Your account and all associated resume data is retained as long as your account exists.",
      "To delete your account and all stored data, contact us at ayuslh.arora@gmail.com with the subject line \"Delete my account\". We will remove your data within 7 days.",
      "Shared resume snapshots are deleted automatically when you revoke the link or delete the resume.",
    ],
  },
  {
    title: "Security",
    body: [
      "All data is transmitted over HTTPS. Firestore security rules ensure users can only read and write their own data. We do not store passwords — authentication is handled by Firebase.",
    ],
  },
  {
    title: "Changes to this policy",
    body: [
      "If we make material changes, we will update the date below and, where appropriate, notify you via the app. Continued use after changes constitutes acceptance.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about this policy? Email us at ayuslh.arora@gmail.com.",
    ],
  },
];

function renderBody(text) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part
  );
}

export default function PrivacyPolicy() {
  const { currentUser } = useAuth();
  useRouteSeo({
    title: "Privacy Policy | ResuMe",
    description: "ResuMe privacy policy — what data we collect, how we use it, and how to delete it.",
    path: "/privacy",
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
      <PublicHeader isDark={isDark} toggleTheme={toggleTheme} currentUser={currentUser} />

      <main style={{ flex: 1, padding: "64px 0" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h1
            className="h-display"
            style={{
              fontSize: "clamp(36px, 5vw, 60px)",
              letterSpacing: "-0.04em",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Privacy{" "}
            <span className="serif italic font-normal text-[var(--accent)]">Policy</span>
          </h1>

          <p
            className="mono text-[12.5px]"
            style={{ color: "var(--muted)", marginTop: 16, marginBottom: 48 }}
          >
            Last updated: June 18, 2026
          </p>

          <p style={{ color: "var(--text-2)", fontSize: 16, lineHeight: 1.7, marginBottom: 48 }}>
            ResuMe is a free resume builder. This page explains what data we collect, why, and
            what you can do about it — in plain English.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: "var(--text)",
                    margin: "0 0 16px",
                  }}
                >
                  {section.title}
                </h2>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {section.body.map((item, i) => (
                    <li
                      key={i}
                      style={{ color: "var(--text-2)", fontSize: 15, lineHeight: 1.7 }}
                    >
                      {renderBody(item)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
