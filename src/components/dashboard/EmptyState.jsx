import { FilePlus } from "lucide-react";

export default function EmptyState({ onCreate }) {
  return (
    <div
      className="panel flex h-[300px] flex-col items-center justify-center border-dashed"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[14px]"
        style={{
          background: "var(--accent-soft)",
          color: "var(--accent)"
        }}>
        <FilePlus size={22} />
      </div>
      <h3 className="h-display mb-1 text-[26px]">No resumes yet</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-[var(--muted)]">
        You haven't built any resumes yet. Create your first one to get started.
      </p>
      <button onClick={onCreate} className="btn btn-accent">
        <FilePlus size={16} />
        Build new resume
      </button>
    </div>
  );
}
