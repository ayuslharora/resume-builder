import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CheckSquare,
  ChevronUp,
  HelpCircle,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useEffect, useRef, useState } from "react";
import { useFirestore } from "../../hooks/useFirestore";
import { subscribeToResumeDeleted } from "../../services/resumeListSync";
import { ShortcutsModal } from "./ShortcutsModal";

function ProfileMenuItem({ icon, label, danger = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[13px] transition hover:bg-[var(--surface-2)] ${
        danger ? "text-[var(--bad)]" : "text-[var(--text)]"
      }`}
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-current opacity-85">
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

function ProfilePopover({ onClose, onProfileSettings, onLogout, onOpenShortcuts }) {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "light");
  const [accent, setAccent] = useState(() => localStorage.getItem("app-accent") || "blue");

  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);
    if (newTheme === "dark") document.body.setAttribute("data-theme", "dark");
    else document.body.removeAttribute("data-theme");
  };

  const updateAccent = (newAccent) => {
    setAccent(newAccent);
    localStorage.setItem("app-accent", newAccent);
    if (newAccent === "mono") document.body.setAttribute("data-accent", "mono");
    else document.body.removeAttribute("data-accent");
  };

  const menuItems = [
    { label: "Profile settings", icon: <User size={14} />, onClick: onProfileSettings },
    { label: "Account & billing", icon: <ShieldCheck size={14} />, onClick: () => { onClose(); navigate("/pricing"); } },
    { label: "Keyboard shortcuts", icon: <Keyboard size={14} />, onClick: onOpenShortcuts },
    { separator: true },
    { label: "Help & docs", icon: <HelpCircle size={14} />, onClick: () => { onClose(); navigate("/help"); } },
    { label: "What's new", icon: <Sparkles size={14} />, onClick: () => { onClose(); navigate("/whats-new"); } },
    { separator: true },
    { label: "Sign out", icon: <LogOut size={14} />, danger: true, onClick: onLogout },
  ];

  return (
    <div
      role="menu"
      aria-label="Account menu"
      onClick={(event) => event.stopPropagation()}
      className="panel absolute bottom-[calc(100%+8px)] left-3 right-3 z-50 p-1 shadow-[var(--shadow-lg)]"
    >
      <div className="border-b border-[var(--border)] px-3 py-2.5">
        <div className="lbl-mono mb-2">Appearance</div>
        <div className="seg w-full">
          <button type="button" data-active={theme === "light"} onClick={() => updateTheme("light")}>
            Light
          </button>
          <button type="button" data-active={theme === "dark"} onClick={() => updateTheme("dark")}>
            Dark
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[11.5px] text-[var(--muted)]">Accent</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Blue accent preview"
              onClick={() => updateAccent("blue")}
              className="h-[18px] w-[18px] rounded-full border border-[var(--border-strong)] bg-[#2563eb] shadow-[0_0_0_1px_var(--bg)_inset] transition-all"
              style={{
                boxShadow: accent === "blue" ? "0 0 0 1.5px var(--bg) inset, 0 0 0 1px var(--text)" : "0 0 0 1px var(--bg) inset",
                transform: accent === "blue" ? "scale(1.1)" : "scale(1)"
              }}
            />
            <button
              type="button"
              aria-label="Mono accent preview"
              onClick={() => updateAccent("mono")}
              className="h-[18px] w-[18px] rounded-full border border-[var(--border-strong)] bg-[var(--text)] shadow-[0_0_0_1px_var(--bg)_inset] transition-all"
              style={{
                boxShadow: accent === "mono" ? "0 0 0 1.5px var(--bg) inset, 0 0 0 1px var(--text)" : "0 0 0 1px var(--bg) inset",
                transform: accent === "mono" ? "scale(1.1)" : "scale(1)"
              }}
            />
          </div>
        </div>
      </div>

      {menuItems.map((item, index) => (
        item.separator ? (
          <hr key={`separator-${index}`} className="hr my-1" />
        ) : (
          <ProfileMenuItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            danger={item.danger}
            onClick={item.onClick || onClose}
          />
        )
      ))}

    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userDoc, logout } = useAuth();
  const { getUserResumes } = useFirestore();
  const [resumes, setResumes] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let cancelled = false;

    async function loadResumes() {
      const data = await getUserResumes(currentUser.uid);
      if (!cancelled) {
        setResumes(data);
      }
    }

    loadResumes().catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [currentUser, getUserResumes]);

  useEffect(() => {
    return subscribeToResumeDeleted((deletedResumeId) => {
      setResumes(prev => prev.filter(resume => resume.id !== deletedResumeId));
    });
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "light";
    const savedAccent = localStorage.getItem("app-accent") || "blue";
    if (savedTheme === "dark") document.body.setAttribute("data-theme", "dark");
    if (savedAccent === "mono") document.body.setAttribute("data-accent", "mono");
  }, []);

  useEffect(() => {
    if (!profileOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  async function handleCreate() {
    if (!currentUser) return;
    navigate("/builder/new");
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  function openProfileSettings() {
    setProfileOpen(false);
    navigate("/profile");
  }

  async function signOutFromMenu() {
    setProfileOpen(false);
    await handleLogout();
  }

  function openShortcutsMenu() {
    setProfileOpen(false);
    setShortcutsOpen(true);
  }

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Grader", path: "/grader", icon: CheckSquare },
    { name: "Resources", path: "/resources", icon: BookOpen },
  ];

  const mobileLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Grader", path: "/grader", icon: CheckSquare },
    { name: "New", path: "/builder/new", icon: Plus },
    { name: "Resources", path: "/resources", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const initials = userDoc?.displayName
    ? userDoc.displayName.split(" ").map(name => name[0]).slice(0, 2).join("")
    : "U";

  const isMobileLinkActive = (path) => (
    path === "/builder/new"
      ? location.pathname === path
      : location.pathname.startsWith(path)
  );

  const MobileProfileAvatar = ({ active }) => (
    <div
      className={`flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold transition-all ${
        active ? "text-[var(--text)]" : "text-[var(--muted)]"
      }`}
      style={{
        background: active ? "var(--surface-2)" : "var(--bg)",
        border: "1px solid var(--border)",
      }}
    >
      {userDoc?.photoURL
        ? <img src={userDoc.photoURL} alt="Profile" className="h-full w-full object-cover" />
        : initials
      }
    </div>
  );

  return (
    <>
      <aside className="app-design app-sidebar-desktop hidden lg:flex fixed left-0 top-0 z-20 h-screen w-[248px] flex-col border-r border-[var(--border)] bg-[var(--bg)]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 pb-3 pt-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div
                className="flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-[7px]"
                style={{
                  boxShadow: "0 1px 2px rgba(15,23,42,.16)",
                }}
              >
                <img src="/favicon.svg" alt="" aria-hidden="true" className="h-full w-full" />
              </div>
              <span className="text-[15px] font-semibold tracking-[-0.01em]">
                Resu<span className="serif italic font-normal">Me</span>
              </span>
            </Link>
          </div>

          <div className="px-3 pb-3">
            <button onClick={handleCreate} className="btn btn-accent w-full">
              <Plus size={14} /> New resume
            </button>
          </div>

          <nav className="scroll flex-1 overflow-y-auto px-2">
            <div className="lbl-mono px-2 pb-2 pt-2">Workspace</div>
            {links.map(link => {
              const isActive = location.pathname.startsWith(link.path) && link.path !== "/";
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  aria-current={isActive ? "page" : undefined}
                  className="navlink"
                  data-active={isActive}
                >
                  <link.icon size={15} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {resumes.length > 0 && (
              <>
                <div className="lbl-mono px-2 pb-2 pt-5">Recent</div>
                {resumes.slice(0, 6).map(resume => {
                  const isResumeActive = location.pathname === `/builder/${resume.id}`;
                  return (
                    <Link
                      key={resume.id}
                      to={`/builder/${resume.id}`}
                      className="navlink"
                      data-active={isResumeActive}
                      title={resume.title || "Untitled Resume"}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-[2px]"
                        style={{ background: resume.isShared ? "#22c55e" : "var(--border-strong)" }}
                      />
                      <span className="truncate text-[12.5px]">{resume.title || "Untitled Resume"}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          <div className="relative border-t border-[var(--border)] p-3" ref={profileMenuRef}>
            {profileOpen && (
              <ProfilePopover
                userDoc={userDoc}
                currentUser={currentUser}
                initials={initials}
                onClose={() => setProfileOpen(false)}
                onProfileSettings={openProfileSettings}
                onLogout={signOutFromMenu}
                onOpenShortcuts={openShortcutsMenu}
              />
            )}

            <button
              type="button"
              aria-label="Open account menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              onClick={() => setProfileOpen(open => !open)}
              className="flex w-full items-center gap-2.5 rounded-md p-1 text-left transition hover:bg-[var(--surface)]"
              data-active={profileOpen}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
                <div className="avatar flex h-[30px] w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--text)]">
                  {userDoc?.photoURL
                    ? <img src={userDoc.photoURL} alt="Profile" className="h-full w-full object-cover" />
                    : initials
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{userDoc?.displayName || currentUser?.displayName || "User"}</div>
                  <div className="truncate text-[11px] text-[var(--muted)]">{currentUser?.email || "Account menu"}</div>
                </div>
              </div>
              <ChevronUp
                size={14}
                className={`shrink-0 text-[var(--muted)] transition-transform ${profileOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className="mono px-1 pt-3 text-[10.5px] text-[var(--faint)]">
              ResuMe by Ayush ·{" "}
              <a href="https://Ayuslh.in" target="_blank" rel="noreferrer" className="ulink text-[var(--muted)]">
                Ayuslh.in
              </a>
            </div>
          </div>
        </div>
      </aside>

      <nav className="app-design app-sidebar-mobile app-mobile-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 gap-1 px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 lg:hidden">
        {mobileLinks.map((link) => {
          const isActive = isMobileLinkActive(link.path);
          const isCenterAction = link.name === "New";
          return (
            <Link
              key={link.name}
              to={link.path}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-1.5 text-[10.5px] ${
                isActive ? "text-[var(--text)]" : "text-[var(--muted)]"
              }`}
            >
              {link.name === "Profile" ? (
                <MobileProfileAvatar active={isActive} />
              ) : (
                <span
                  className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px]"
                  style={{
                    background: isCenterAction
                      ? "var(--accent)"
                      : isActive
                        ? "var(--surface-2)"
                        : "transparent",
                    color: isCenterAction ? "white" : "currentColor",
                  }}
                >
                  <link.icon size={isCenterAction ? 18 : 19} strokeWidth={isActive || isCenterAction ? 2.4 : 2} />
                </span>
              )}
              <span className={isCenterAction ? "font-semibold" : ""}>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </>
  );
}
