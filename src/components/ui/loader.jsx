/**
 * loader.jsx
 * Premium animated loaders that match the "Midnight Luminary" design system.
 * Usage:  import { LoaderOne } from "@/components/ui/loader";
 */

export function LoaderOne({ size = "md", label = "Loading..." }) {
  const sizes = {
    sm: { dot: "w-2 h-2", gap: "gap-1.5", text: "text-[10px]" },
    md: { dot: "w-3 h-3", gap: "gap-2", text: "text-xs" },
    lg: { dot: "w-4 h-4", gap: "gap-3", text: "text-sm" },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none mt-4 text-[var(--loading-fg,#111111)]">
      {/* ── Bouncing Dots ── */}
      <div className={`flex items-center ${s.gap}`}>
        <div className={`${s.dot} rounded-full bg-current animate-bounce`} style={{ animationDelay: "-0.3s", opacity: 0.95 }} />
        <div className={`${s.dot} rounded-full bg-current animate-bounce`} style={{ animationDelay: "-0.15s", opacity: 0.7 }} />
        <div className={`${s.dot} rounded-full bg-current animate-bounce`} style={{ opacity: 0.45 }} />
      </div>

      {/* ── Label ── */}
      {label && (
        <p className={`${s.text} font-semibold tracking-widest uppercase animate-pulse`} style={{ color: "color-mix(in oklch, var(--loading-fg,#111111) 62%, transparent)" }}>
          {label}
        </p>
      )}
    </div>
  );
}
