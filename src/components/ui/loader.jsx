/**
 * loader.jsx
 * Premium animated loaders that match the "Midnight Luminary" design system.
 * Usage:  import { LoaderOne } from "@/components/ui/loader";
 */

/**
 * LoaderOne — Three concentric rings that counter-rotate with a pulsing
 * core dot. Uses the app's cyan primary color (#06b6d4).
 */
export function LoaderOne({ size = "md", label = "Loading..." }) {
  const sizes = {
    sm: { dot: "w-2 h-2", gap: "gap-1.5", text: "text-[10px]" },
    md: { dot: "w-3 h-3", gap: "gap-2", text: "text-xs" },
    lg: { dot: "w-4 h-4", gap: "gap-3", text: "text-sm" },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div className="flex flex-col items-center justify-center gap-4 select-none mt-4">
      {/* ── Bouncing Dots ── */}
      <div className={`flex items-center ${s.gap}`}>
        <div className={`${s.dot} rounded-full bg-[#d1d5db] animate-bounce`} style={{ animationDelay: '-0.3s' }}></div>
        <div className={`${s.dot} rounded-full bg-[#d1d5db] animate-bounce`} style={{ animationDelay: '-0.15s' }}></div>
        <div className={`${s.dot} rounded-full bg-[#d1d5db] animate-bounce`}></div>
      </div>

      {/* ── Label ── */}
      {label && (
        <p className={`${s.text} font-semibold tracking-widest uppercase text-[#9ca3af] animate-pulse`}>
          {label}
        </p>
      )}
    </div>
  );
}
