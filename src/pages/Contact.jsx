import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, MessageSquare, Send } from "lucide-react";
import { useRouteSeo } from "../seo/routeSeo";
import PublicFooter from "../components/layout/PublicFooter";
import PublicHeader from "../components/layout/PublicHeader";

export default function Contact() {
  useRouteSeo({
    title: "Contact | ResuMe",
    description: "Get in touch with the ResuMe team. We're here to help you land your dream job.",
    path: "/contact",
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app-theme") || "light";
    }
    return "light";
  });

  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);
    
    try {
      setStatus("SUBMITTING");
      const response = await fetch("https://formspree.io/f/mykvgnrb", {
        method: "POST",
        body: data,
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        setStatus("SUCCESS");
        form.reset();
      } else {
        setStatus("ERROR");
      }
    } catch (err) {
      setStatus("ERROR");
    }
  };

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
      <PublicHeader isDark={isDark} toggleTheme={toggleTheme} />

      <main style={{ flex: 1, padding: "64px 0" }}>
        <section className="container">
          <div className="text-center mb-16">
            <h1 className="h-display" style={{ fontSize: "clamp(48px, 6vw, 84px)", letterSpacing: "-0.05em", margin: 0, lineHeight: 0.94 }}>
              Let's talk. <br className="hidden sm:block" />
              <span className="serif italic font-normal text-[var(--accent)]">No bots, just us.</span>
            </h1>

            <p style={{ color: "var(--text-2)", fontSize: "clamp(16px, 2vw, 20px)", lineHeight: 1.6, marginTop: 32, maxWidth: 680, marginInline: "auto" }}>
              Got a question, bug report, or just want to tell us how you landed that six-figure job? We read every message. Drop us a line below.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="panel p-8 md:p-10 relative overflow-hidden" style={{ background: "linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)", border: "1px solid var(--border)", borderRadius: 24, boxShadow: "0 20px 40px -20px rgba(0,0,0,0.1)" }}>
              {status === "SUCCESS" ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ background: "var(--accent-soft)", color: "var(--accent)" }}>
                    <Send size={32} />
                  </div>
                  <h3 className="h-display text-2xl mb-4 text-[var(--text)]">Message Sent!</h3>
                  <p className="text-[var(--text-2)] mb-8">Thanks for reaching out. We'll get back to you as soon as possible.</p>
                  <button onClick={() => setStatus("")} className="btn btn-outline">Send another message</button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all" 
                      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} 
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      required
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all" 
                      style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} 
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all" 
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} 
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>How can we help?</label>
                  <select 
                    name="subject"
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all appearance-none" 
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }}
                  >
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="business">Business Inquiries</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13.5px] font-semibold mb-2" style={{ color: "var(--text)" }}>Message</label>
                  <textarea 
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all resize-none" 
                    style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text)" }} 
                    placeholder="Tell us what's on your mind..."
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={status === "SUBMITTING"}
                    className="btn btn-accent w-full justify-center btn-lg disabled:opacity-70 disabled:cursor-not-allowed" 
                    style={{ fontSize: 16 }}
                  >
                    {status === "SUBMITTING" ? "Sending..." : "Send Message"} <Send size={18} className="ml-2" />
                  </button>
                  {status === "ERROR" && (
                    <p className="text-red-500 text-sm text-center mt-3">Oops! There was a problem submitting your form.</p>
                  )}
                </div>
              </form>
              )}
            </div>
            

          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
