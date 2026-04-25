import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen text-on-surface relative overflow-hidden">

      {/* ── Ambient background orbs ── */}
      <div className="orb w-[600px] h-[600px] bg-cyan-500/6 -top-64 right-1/4 animate-float-slow pointer-events-none" style={{ zIndex: 0 }} />
      <div className="orb w-[400px] h-[400px] bg-purple-600/5 bottom-0 left-1/3 animate-float-medium pointer-events-none" style={{ animationDelay: "-4s", zIndex: 0 }} />

      <Sidebar />

      <div className="lg:ml-[260px] flex flex-col relative w-full lg:w-[calc(100%-260px)] min-h-screen" style={{ zIndex: 1 }}>
        <main className="flex-1 pt-6 lg:pt-10 px-4 sm:px-6 lg:px-10 pb-12 w-full mt-16 lg:mt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
