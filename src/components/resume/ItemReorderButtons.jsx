import { ChevronUp, ChevronDown } from "lucide-react";

export default function ItemReorderButtons({ index, total, onMove, className = "text-blue-500 hover:text-blue-700 hover:bg-blue-500/10" }) {
  const btnClass = `flex items-center justify-center w-4 h-4 rounded transition-colors disabled:opacity-20 disabled:cursor-not-allowed ${className}`;
  return (
    <span
      contentEditable={false}
      className="inline-flex flex-col shrink-0"
      style={{ gap: 1 }}
    >
      <button
        type="button"
        disabled={index === 0}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onMove(index, index - 1); }}
        className={btnClass}
        title="Move up"
      >
        <ChevronUp size={11} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        disabled={index === total - 1}
        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onMove(index, index + 1); }}
        className={btnClass}
        title="Move down"
      >
        <ChevronDown size={11} strokeWidth={2.5} />
      </button>
    </span>
  );
}
