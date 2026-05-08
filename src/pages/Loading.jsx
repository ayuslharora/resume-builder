import React from "react";
import { LoaderOne } from "@/components/ui/loader";

export function LoaderOneDemo() {
  return <LoaderOne />;
}

/**
 * Loading — full-screen loading page with ResuMe branding.
 * Used as the Suspense fallback and any page-level loading state.
 */
export default function Loading() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-10 fade-in relative overflow-hidden"
      style={{ background: "var(--loading-bg,#ffffff)", color: "var(--loading-fg,#111111)" }}
    >
      {/* ── Brand mark ── */}
      <div className="flex items-center gap-2.5 select-none relative z-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center border"
          style={{ borderColor: "color-mix(in oklch, var(--loading-fg,#111111) 35%, transparent)", color: "var(--loading-fg,#111111)" }}>
          <svg
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ color: "var(--loading-fg,#111111)" }}>
          ResuMe
        </span>
      </div>

      {/* ── Loader ── */}
      <LoaderOne size="lg" label="Initializing workspace..." />
    </div>
  );
}
