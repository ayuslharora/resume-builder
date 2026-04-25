import { FilePlus } from "lucide-react";

export default function EmptyState({ onCreate }) {
  return (
    <div
      className="flex flex-col justify-center items-center h-[300px] rounded-xl"
      style={{
        background: "rgba(25,31,49,0.3)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px dashed rgba(6,182,212,0.2)"
      }}
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
        style={{
          background: "rgba(6,182,212,0.08)",
          border: "1px solid rgba(6,182,212,0.15)",
          boxShadow: "0 0 16px rgba(6,182,212,0.1)"
        }}>
        <FilePlus size={20} className="text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-on-surface mb-1">No Resumes Yet</h3>
      <p className="text-sm text-on-surface-variant mb-6 text-center max-w-xs">
        You haven't built any resumes yet. Create your first one to get started.
      </p>
      <button onClick={onCreate} className="btn-primary">
        <FilePlus size={16} />
        Build New Resume
      </button>
    </div>
  );
}
