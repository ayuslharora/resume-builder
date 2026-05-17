import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";

const NAV_ITEMS = [
  { label: "Product", to: "/" },
  { label: "Templates", to: "/templates" },
  { label: "Grader", to: "/grader-info" },
  { label: "Pricing", to: "/pricing" },
  { label: "Contact", to: "/contact" },
  { label: "Get started", to: "/signup", accent: true },
];

function BrandLogo({ color = "var(--text)" }) {
  return (
    <>
      <div
        className="flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-[7px]"
        style={{ boxShadow: "0 1px 2px rgba(15,23,42,.16)" }}
      >
        <img src="/favicon.svg" alt="" aria-hidden="true" className="h-full w-full" />
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color }}>
        Resu<span className="serif italic font-normal">Me</span>
      </span>
    </>
  );
}

export default function PublicHeader({ isDark, toggleTheme }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  return (
    <>
      {/* Desktop/page header — hidden when mobile nav is open */}
      {!mobileNavOpen && (
        <header
          className="border-b border-[var(--border)]"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            background: "color-mix(in oklch, var(--bg) 78%, transparent)",
          }}
        >
          <div className="container" style={{ display: "flex", alignItems: "center", height: 64, gap: 24 }}>
            <Link to="/" className="flex items-center gap-2">
              <BrandLogo />
            </Link>
            <nav className="hidden md:flex" style={{ gap: 22, marginLeft: 32 }}>
              {NAV_ITEMS.filter(i => !i.accent).map(({ label, to }) => {
                const active = pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`ulink text-[13.5px] ${active ? "text-[var(--text)] font-medium" : "text-[var(--text-2)]"}`}
                  >
                    {label}
                  </Link>
                );
              })}
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
              <Link to="/signup" className="btn btn-primary btn-sm hidden md:inline-flex">Get started</Link>
            </div>
          </div>
        </header>
      )}

      {/* Hamburger trigger — fixed bottom-right, hidden when nav is open */}
      {!mobileNavOpen && (
        <button
          className="landing-mobile-nav-trigger md:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={22} strokeWidth={2.2} aria-hidden="true" />
        </button>
      )}

      {/* Full-screen mobile nav overlay */}
      {mobileNavOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif",
          }}
        >
          {/* Overlay header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 64, flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
              <BrandLogo color="#fafafa" />
            </Link>
            <button
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close navigation"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, cursor: "pointer", background: "transparent", border: "none" }}
            >
              <X size={22} color="#71717a" />
            </button>
          </div>

          {/* Nav links */}
          <nav
            aria-label="Site navigation"
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
          >
            {NAV_ITEMS.map(({ label, to, accent }) => {
              const current = !accent && pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={current ? "page" : undefined}
                  onClick={() => setMobileNavOpen(false)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "center",
                    fontSize: "clamp(32px, 9.5vw, 44px)",
                    fontWeight: current || accent ? 700 : 600,
                    color: current ? "#ffffff" : accent ? "#3b82f6" : "#a1a1aa",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.25,
                    padding: "7px 0",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
