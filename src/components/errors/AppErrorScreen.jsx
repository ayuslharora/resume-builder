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
    <div className="app-design flex min-h-screen items-center justify-center bg-[var(--surface)] px-4 py-10 text-[var(--text)] fade-in">
      <div className="panel w-full max-w-2xl p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-[var(--bad)]"
            style={{ background: "var(--bad-soft)", borderColor: "color-mix(in oklch, var(--bad), transparent 78%)" }}
          >
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0">
            <p className="lbl-mono mb-2 text-[var(--bad)]">
              Application issue
            </p>
            <h1 className="h-display m-0 text-[26px] leading-tight sm:text-[30px]">
              {state.title}
            </h1>
          </div>
        </div>

        <p className="mt-5 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-[15px]">
          {state.message}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={handleRetry} className="btn btn-accent w-full">
            <RefreshCw size={16} />
            {state.kind === "chunk-load" ? "Refresh app" : "Try again"}
          </button>

          <button type="button" onClick={handleReset} className="btn btn-outline w-full">
            {onReset ? <RotateCcw size={16} /> : <Home size={16} />}
            {onReset ? "Reset screen" : "Go to safety"}
          </button>
        </div>

        <div className="mt-6 rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <p className="lbl-mono">
            Technical details
          </p>
          <p className="mono mt-2 break-words text-xs leading-6 text-[var(--muted)]">
            {state.detail}
          </p>
        </div>
      </div>
    </div>
  );
}
