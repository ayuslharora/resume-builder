import { AlertTriangle, Home, RefreshCw, RotateCcw } from "lucide-react";
import { classifyAppError } from "../../utils/errorPresentation";

function getHomePath() {
  if (typeof window === "undefined") {
    return "/";
  }

  const publicPaths = new Set(["/", "/login", "/signup"]);
  return publicPaths.has(window.location.pathname) ? "/" : "/dashboard";
}

export default function AppErrorScreen({ error, onRetry, onReset }) {
  const state = classifyAppError(error);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }

    window.location.reload();
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
      return;
    }

    window.location.assign(getHomePath());
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden fade-in">
      <div className="orb w-[28rem] h-[28rem] bg-cyan-500/10 -top-24 -left-20 animate-float-slow" />
      <div className="orb w-[24rem] h-[24rem] bg-purple-600/10 -bottom-24 -right-16 animate-float-medium" />

      <div className="glass-strong relative z-10 w-full max-w-2xl rounded-[2rem] p-6 sm:p-8 shadow-glass">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-300 shadow-[0_0_24px_rgba(248,113,113,0.12)]">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-200/80">
              Application issue
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              {state.title}
            </h1>
          </div>
        </div>

        <p className="mt-5 max-w-xl text-sm sm:text-base leading-7 text-on-surface-variant">
          {state.message}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={handleRetry} className="btn-primary w-full">
            <RefreshCw size={16} />
            {state.kind === "chunk-load" ? "Refresh app" : "Try again"}
          </button>

          <button type="button" onClick={handleReset} className="btn-ghost w-full">
            {onReset ? <RotateCcw size={16} /> : <Home size={16} />}
            {onReset ? "Reset screen" : "Go to safety"}
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-white/8 bg-black/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant/80">
            Technical details
          </p>
          <p className="mt-2 break-words font-mono text-xs leading-6 text-on-surface-variant">
            {state.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
