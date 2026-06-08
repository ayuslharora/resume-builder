import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import Spinner from "../ui/Spinner";
import AppLayout from "../layout/AppLayout";
import PublicHeader from "../layout/PublicHeader";
import PublicFooter from "../layout/PublicFooter";

function PublicShell() {
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
    const bg = isDark ? "#0a0a0b" : "#ffffff";
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
    : {};

  return (
    <div
      className={`app-design min-h-screen ${isDark ? "dark" : ""}`}
      style={{
        ...themeStyles,
        background: "var(--bg)",
        color: "var(--text)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <PublicHeader isDark={isDark} toggleTheme={toggleTheme} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}

export default function SemiPublicRoute() {
  const { currentUser, loading } = useAuth();
  if (loading) return <Spinner />;
  return currentUser ? <AppLayout /> : <PublicShell />;
}
