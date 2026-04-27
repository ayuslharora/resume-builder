import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, BookOpen, CheckSquare, LogOut, Menu, X, Plus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { getCachedResumeList, setCachedResumeList } from "../../services/resumeCache";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userDoc, logout } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const usesSharedResumeList =
    location.pathname.startsWith("/resumes") || location.pathname.startsWith("/dashboard");

  useEffect(() => {
    if (!currentUser) {
      setResumes([]);
      return;
    }

    const cached = getCachedResumeList(currentUser.uid);
    if (cached.length > 0) {
      setResumes(cached);
    }

    if (usesSharedResumeList) {
      return;
    }

    const q = query(
      collection(db, "resumes"),
      where("userId", "==", currentUser.uid),
      orderBy("updatedAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResumes(data);
      setCachedResumeList(currentUser.uid, data);
    });
    return () => unsubscribe();
  }, [currentUser, usesSharedResumeList]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  async function handleCreate() {
    if (!currentUser) return;
    navigate(`/builder/new`);
  }

  const links = [
    { name: "Dashboard",     path: "/dashboard", icon: LayoutDashboard },
    { name: "My Resumes",    path: "/resumes",   icon: FileText },
    { name: "Resume Grader", path: "/grader",    icon: CheckSquare },
    { name: "Resources",     path: "/resources", icon: BookOpen },
  ];

  const initials = userDoc?.displayName
    ? userDoc.displayName.split(" ").map(n => n[0]).slice(0, 2).join("")
    : "U";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* ── Brand ── */}
      <div className="px-5 pt-6 pb-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)", boxShadow: "0 0 12px rgba(6,182,212,0.4)" }}>
            <FileText size={14} className="text-surface" />
          </div>
          <span className="font-bold text-base text-on-surface tracking-tight">
            Resume<span className="text-primary">Forge</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1 text-on-surface-variant hover:text-on-surface rounded transition"
        >
          <X size={18} />
        </button>
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
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                )}
                <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-primary" : ""} />
                <span className={isActive ? "text-on-surface font-semibold" : ""}>{link.name}</span>
              </Link>

              {/* Resume sub-items under "My Resumes" */}
              {link.name === "My Resumes" && resumes.length > 0 && (
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
            </div>
          </button>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors flex-shrink-0"
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 z-30 flex items-center justify-between px-4"
        style={{
          background: "rgba(7,13,31,0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)"
        }}>
        <span className="font-bold text-base text-on-surface">
          Resume<span className="text-primary">Forge</span>
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-on-surface-variant hover:text-on-surface rounded-md transition"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50 flex flex-col transition-transform duration-250
          w-[260px]
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:z-20
        `}
        style={{
          background: "rgba(7,13,31,0.82)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.06)"
        }}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
