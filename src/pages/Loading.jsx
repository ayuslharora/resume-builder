import React from "react";
import { LoaderOne } from "@/components/ui/loader";

export function LoaderOneDemo() {
  return <LoaderOne />;
}

/**
 * Loading — full-screen loading page with ResumeForge branding.
 * Used as the Suspense fallback and any page-level loading state.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-10 fade-in relative overflow-hidden">
      <div className="orb w-96 h-96 bg-cyan-500/8 -top-32 -left-32 animate-float-slow" />
      <div className="orb w-80 h-80 bg-purple-600/6 -bottom-32 -right-32 animate-float-medium" />
      {/* ── Brand mark ── */}
      <div className="flex items-center gap-2.5 select-none relative z-10">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", boxShadow: "0 0 16px rgba(6,182,212,0.4)" }}>
          <svg
            width="16" height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-surface"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <span className="font-bold text-lg text-on-surface tracking-tight">
          Resume<span className="text-primary">Forge</span>
        </span>
      </div>

      {/* ── Loader ── */}
      <LoaderOne size="lg" label="Initializing workspace..." />
    </div>
  );
}
