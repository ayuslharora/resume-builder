import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, BookOpen, CheckSquare, LogOut, Plus, User } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import { useEffect, useState } from "react";
import { useFirestore } from "../../hooks/useFirestore";
import { subscribeToResumeDeleted } from "../../services/resumeListSync";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userDoc, logout } = useAuth();
  const { getUserResumes } = useFirestore();
  const [resumes, setResumes] = useState([]);

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

  async function handleCreate() {
    if (!currentUser) return;
    navigate(`/builder/new`);
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  }

  const links = [
    { name: "Dashboard",     path: "/dashboard", icon: LayoutDashboard },
    { name: "Resume Grader", path: "/grader",    icon: CheckSquare },
    { name: "Resources",     path: "/resources", icon: BookOpen },
  ];

  const mobileLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Grader", path: "/grader", icon: CheckSquare },
    { name: "New", path: "/builder/new", icon: Plus },
    { name: "Resources", path: "/resources", icon: BookOpen },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const initials = userDoc?.displayName
    ? userDoc.displayName.split(" ").map(n => n[0]).slice(0, 2).join("")
    : "U";

  const isMobileLinkActive = (path) => (
    path === "/builder/new"
      ? location.pathname === path
      : location.pathname.startsWith(path)
  );

  const MobileProfileAvatar = ({ active }) => (
    <div
      className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[11px] font-bold transition-all ${
        active ? "text-on-surface shadow-[0_0_14px_rgba(6,182,212,0.24)]" : "text-on-surface-variant"
      }`}
      style={{
        background: active ? "linear-gradient(180deg, rgba(8,145,178,0.28) 0%, rgba(14,116,144,0.18) 100%)" : "rgba(35,41,60,0.9)",
        border: active ? "1px solid rgba(6,182,212,0.38)" : "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {userDoc?.photoURL
        ? <img src={userDoc.photoURL} alt="Profile" className="w-full h-full object-cover" />
        : initials
      }
    </div>
  );

  function renderSidebarContent() {
    return (
    <div className="flex flex-col h-full">
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5 flex items-center" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", boxShadow: "0 0 12px rgba(6,182,212,0.4)" }}>
            <FileText size={14} className="text-surface" />
          </div>
          <span className="font-bold text-base text-on-surface tracking-tight">
            Resu<span className="text-primary">Me</span>
          </span>
        </Link>
      </div>

      {/* ── New Resume ── */}
      <div className="px-4 pt-5 pb-3">
        <button
          onClick={handleCreate}
          className="w-full btn-primary text-sm py-2"
        >
          <Plus size={15} />
          New Resume
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar space-y-0.5">
        {links.map(link => {
          const isActive = location.pathname.startsWith(link.path) && link.path !== "/";
          return (
            <div key={link.name}>
              <Link
                to={link.path}
                aria-current={isActive ? "page" : undefined}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                )}
                <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-primary" : ""} />
                <span className={isActive ? "text-on-surface font-semibold" : ""}>{link.name}</span>
              </Link>

              {/* Resume sub-items under Dashboard */}
              {link.name === "Dashboard" && resumes.length > 0 && (
                <div className="ml-7 pl-3 mt-0.5 mb-1 space-y-0.5" style={{ borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
                  {resumes.slice(0, 6).map(resume => {
                    const isResumeActive = location.pathname === `/builder/${resume.id}`;
                    return (
                      <Link
                        key={resume.id}
                        to={`/builder/${resume.id}`}
                        className={`block text-xs py-1 px-2 rounded truncate transition-colors ${
                          isResumeActive
                            ? "text-primary font-semibold bg-primary/5"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                        title={resume.title || "Untitled Resume"}
                      >
                        {resume.title || "Untitled Resume"}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── User footer ── */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="flex items-center gap-2.5 min-w-0 flex-1 rounded-lg p-1.5 -m-1.5 transition-all duration-200 hover:bg-white/5 text-left"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-on-surface"
              style={{ background: "rgba(35,41,60,0.8)", border: "1px solid rgba(6,182,212,0.2)", boxShadow: "0 0 8px rgba(6,182,212,0.1)" }}>
              {userDoc?.photoURL
                ? <img src={userDoc.photoURL} alt="Profile" className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface truncate">{userDoc?.displayName || "User"}</p>
              <p className="text-[10px] text-on-surface-variant truncate">Edit profile</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]">
                <a
                  href="https://Ayuslh.in"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary/80 transition-colors hover:text-primary"
                  onClick={(event) => event.stopPropagation()}
                >
                  ResuMe by Ayush
                </a>
              </div>
            </div>
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors flex-shrink-0"
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="app-sidebar-desktop hidden lg:flex fixed top-0 left-0 h-screen z-20 flex-col w-[260px]"
        style={{
          background: "rgba(7,13,31,0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        {renderSidebarContent()}
      </aside>

      <nav
        className="app-sidebar-mobile lg:hidden fixed inset-x-3 z-30 grid grid-cols-5 gap-1 rounded-[1.75rem] p-2"
        style={{
          bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
          paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
          background: "linear-gradient(180deg, rgba(10,18,38,0.92) 0%, rgba(7,13,31,0.96) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 45px rgba(2,8,23,0.45), 0 0 0 1px rgba(6,182,212,0.05) inset"
        }}
      >
        {mobileLinks.map((link) => {
          const isActive = isMobileLinkActive(link.path);
          const isCenterAction = link.name === "New";
          return (
            <Link
              key={link.name}
              to={link.path}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-col items-center justify-center px-2 text-[11px] font-medium transition-all duration-200 ${
                isCenterAction
                  ? "-mt-3 gap-1.5"
                  : "gap-1 rounded-2xl py-2.5"
              } ${
                isActive || isCenterAction
                  ? "text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
              style={{
                background: isCenterAction
                  ? "transparent"
                  : isActive
                    ? "linear-gradient(180deg, rgba(8,145,178,0.22) 0%, rgba(14,116,144,0.14) 100%)"
                    : "transparent",
                boxShadow: isCenterAction
                  ? "none"
                  : isActive
                    ? "0 0 18px rgba(6,182,212,0.14)"
                    : "none",
              }}
            >
              {link.name === "Profile" ? (
                <MobileProfileAvatar active={isActive} />
              ) : isCenterAction ? (
                <div
                  className="w-12 h-12 rounded-[1rem] flex items-center justify-center transition-transform duration-200"
                  style={{
                    background: isActive
                      ? "linear-gradient(180deg, rgba(14,165,233,0.38) 0%, rgba(8,145,178,0.24) 100%)"
                      : "linear-gradient(180deg, rgba(14,165,233,0.28) 0%, rgba(8,145,178,0.18) 100%)",
                    border: "1px solid rgba(103,232,249,0.28)",
                    boxShadow: "0 8px 20px rgba(6,182,212,0.18), 0 0 0 1px rgba(255,255,255,0.05) inset",
                  }}
                >
                  <link.icon
                    size={20}
                    strokeWidth={2.6}
                    className="text-cyan-50"
                  />
                </div>
              ) : (
                <link.icon
                  size={18}
                  strokeWidth={isActive ? 2.4 : 2}
                  className={isActive ? "text-primary" : ""}
                />
              )}
              <span className={isCenterAction ? "font-semibold tracking-[0.01em]" : ""}>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
