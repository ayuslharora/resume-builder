import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useKeyboardShortcut } from "../../hooks/useKeyboardShortcut";
import { CommandPalette } from "./CommandPalette";

export default function AppLayout() {
  const location = useLocation();
  const isBuilderRoute = location.pathname.startsWith("/builder");
  const [paletteOpen, setPaletteOpen] = useState(false);

  useKeyboardShortcut("k", () => setPaletteOpen(true), { global: false });
  useKeyboardShortcut("f", () => setPaletteOpen(true), { global: false });

  if (isBuilderRoute) {
    return (
      <div className="flex min-h-screen text-on-surface relative">

        {/* ── Ambient background orbs ── */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
          <div className="orb w-[600px] h-[600px] bg-cyan-500/6 -top-64 right-1/4 animate-float-slow" />
          <div className="orb w-[400px] h-[400px] bg-purple-600/5 bottom-0 left-1/3 animate-float-medium" style={{ animationDelay: "-4s" }} />
        </div>

        <Sidebar />

        <div className="app-shell-main lg:ml-[248px] flex flex-col relative w-full lg:w-[calc(100%-248px)] min-h-screen" style={{ zIndex: 1 }}>
          <main className="flex-1 pt-6 lg:pt-10 px-4 sm:px-6 lg:px-10 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-12 w-full">
            <Outlet />
          </main>
        </div>

        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
      </div>
    );
  }

  return (
    <div className="app-design app-shell flex min-h-screen">
      <Sidebar />

      <div className="app-main lg:ml-[248px] flex min-h-screen w-full flex-col lg:w-[calc(100%-248px)]">
        <main className="scroll flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
