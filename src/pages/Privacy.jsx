import { useState, useEffect } from "react";
import { useRouteSeo } from "../seo/routeSeo";
import PublicFooter from "../components/layout/PublicFooter";
import PublicHeader from "../components/layout/PublicHeader";
import { useAuth } from "../context/useAuth";

const SECTIONS = [
  {
    title: "Information We Collect",
    body: [
      "**Account information.** When you register, we store your email address and display name via Firebase Authentication.",
      "**Resume content.** All content you enter into your resume (name, phone number, work history, skills, and similar details) is stored in Firestore and associated with your account so it is accessible across devices.",
      "**AI feature input.** When you use AI-powered features such as bullet rewrites, ATS grading, or cover letter generation, the relevant portions of your resume are transmitted to Groq's API to produce a response. We do not retain these requests beyond what is already stored in Firestore.",
      "**Shared resume links.** If you generate a public share link, the associated resume snapshot is accessible to anyone who has that link. You may revoke access at any time from the Builder.",
      "**Contact form submissions.** Messages submitted through the Contact page are processed by Formspree and forwarded to us by email. We do not store them in our own database.",
      "**Page-view analytics.** We use Vercel Analytics to collect anonymous page-view counts and basic browser metadata, including browser type and country. No cookies are used for this purpose, and no personally identifiable information is associated with these events.",
    ],
  },
  {
    title: "Information We Do Not Collect",
    body: [
      "We do not sell your personal data to third parties.",
      "We do not use your resume content for advertising or marketing purposes.",
      "We do not deploy third-party advertising trackers or retargeting pixels.",
      "We do not access your resume content for any purpose other than displaying it to you and powering the AI features you explicitly activate.",
    ],
  },
  {
    title: "How We Use Your Information",
    body: [
      "To provide access to your resumes across sessions and devices.",
      "To process AI features that you initiate. Your content is transmitted to Groq only at the moment you trigger a specific AI action.",
      "To collect anonymous, aggregated usage metrics that help us understand which features are most valuable.",
      "To respond to inquiries submitted through the Contact page.",
    ],
  },
  {
    title: "Third-Party Services",
    body: [
      "**Firebase (Google).** Used for authentication and database storage. Subject to Google's Privacy Policy.",
      "**Groq.** Used for AI inference. Resume content is sent to Groq only when you use an AI feature. Subject to Groq's Privacy Policy.",
      "**Vercel.** Used for hosting and anonymous analytics. Subject to Vercel's Privacy Policy.",
      "**Formspree.** Used to process contact form submissions. Subject to Formspree's Privacy Policy.",
    ],
  },
  {
    title: "Data Retention and Deletion",
    body: [
      "Your account and all associated resume data are retained for as long as your account remains active.",
      "To request deletion of your account and all associated data, please contact us at ayuslh.arora@gmail.com with the subject line \"Delete my account\". We will process your request within 7 days.",
      "Shared resume snapshots are removed automatically when you revoke the corresponding link or delete the resume.",
    ],
  },
  {
    title: "Security",
    body: [
      "All data is transmitted over HTTPS. Firestore security rules are configured to ensure that users can only access their own data. We do not store passwords; authentication is managed entirely by Firebase.",
    ],
  },
  {
    title: "Changes to This Policy",
    body: [
      "If we make material changes to this policy, we will update the effective date shown below and, where appropriate, provide notice within the application. Continued use of the service following any changes constitutes your acceptance of the revised policy.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If you have questions or concerns regarding this policy, please contact us at ayuslh.arora@gmail.com.",
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
            This Privacy Policy describes what information ResuMe collects, how it is used, and the choices available to you.
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
