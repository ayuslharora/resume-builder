import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function TopNav() {
  const { userDoc, logout } = useAuth();
  const navigate = useNavigate();

  const initials = userDoc?.displayName
    ? userDoc.displayName.split(" ").map(n => n[0]).slice(0, 2).join("")
    : "U";

  return (
    <header
      className="fixed top-13 lg:top-0 left-0 lg:left-[260px] right-0 h-14 lg:h-16 flex justify-between items-center px-4 sm:px-6 lg:px-8 z-10"
      style={{
        background: "rgba(7,13,31,0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}
    >
      <div />

      <div className="flex flex-1 justify-end items-center gap-4">
        <div className="flex items-center gap-3 cursor-pointer group relative">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-on-surface transition-all duration-200 group-hover:ring-2 group-hover:ring-primary/40"
            style={{
              background: "rgba(35,41,60,0.8)",
              border: "1px solid rgba(6,182,212,0.2)",
              boxShadow: "0 0 8px rgba(6,182,212,0.1)"
            }}>
            {userDoc?.photoURL ? (
              <img src={userDoc.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : initials}
          </div>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-32 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1"
            style={{
              background: "rgba(10,15,30,0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
            }}>
            <button
              onClick={() => { logout(); navigate("/"); }}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
