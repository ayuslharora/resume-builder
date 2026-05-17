import { useState } from "react";
import { AlertCircle, AlertTriangle, Lightbulb, X, Play, Loader2, Wand2, Check } from "lucide-react";
import { issuesBySeverity } from "../../services/resumeHealthCheck";

const SEVERITY_CONFIG = {
  error: {
    icon: AlertCircle,
    dotColor: "bg-red-500",
    labelColor: "text-red-400",
    cardStyle: { background: "var(--bad-soft)", border: "1px solid rgba(185,28,28,0.2)" },
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    dotColor: "bg-amber-400",
    labelColor: "text-amber-400",
    cardStyle: { background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.22)" },
    label: "Warning",
  },
  suggestion: {
    icon: Lightbulb,
    dotColor: "bg-blue-400",
    labelColor: "text-blue-400",
    cardStyle: { background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.18)" },
    label: "Suggestion",
  },
};

function IssueCard({ issue, onAiShortenSummary, isShorteningAi, summaryRewritten }) {
  const config = SEVERITY_CONFIG[issue.severity];
  const Icon = config.icon;

  return (
    <div className="rounded-xl p-4 space-y-2" style={config.cardStyle}>
      <div className="flex items-start gap-3">
        <Icon size={15} className={`${config.labelColor} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-on-surface leading-snug">{issue.message}</div>
          <div className="text-xs text-on-surface-variant leading-relaxed mt-1">{issue.suggestion}</div>
        </div>
      </div>

      {issue.canAifix && (
        <div className="pl-6">
          {summaryRewritten ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Check size={13} />
              Summary shortened — review it in the editor
            </div>
          ) : (
            <button
              onClick={onAiShortenSummary}
              disabled={isShorteningAi}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              style={{ background: "rgba(59,130,246,0.12)", color: "var(--accent)", border: "1px solid rgba(59,130,246,0.25)" }}
            >
              {isShorteningAi ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Wand2 size={12} />
              )}
              {isShorteningAi ? "Rewriting…" : "Shorten with AI"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SeverityGroup({ title, issues, onAiShortenSummary, isShorteningAi, summaryRewritten }) {
  if (!issues.length) return null;
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant px-1">
        {title} ({issues.length})
      </div>
      {issues.map((issue) => (
        <IssueCard
          key={issue.id}
          issue={issue}
          onAiShortenSummary={onAiShortenSummary}
          isShorteningAi={isShorteningAi}
          summaryRewritten={summaryRewritten}
        />
      ))}
    </div>
  );
}

export default function RenderHealthCheckModal({
  issues,
  onClose,
  onContinue,
  onAiShortenSummary,
}) {
  const [isShorteningAi, setIsShorteningAi] = useState(false);
  const [summaryRewritten, setSummaryRewritten] = useState(false);
  const [aiError, setAiError] = useState(null);

  const { errors, warnings, suggestions } = issuesBySeverity(issues);
  const hasBlockers = errors.length > 0;

  const handleAiShorten = async () => {
    setIsShorteningAi(true);
    setAiError(null);
    try {
      await onAiShortenSummary();
      setSummaryRewritten(true);
    } catch (err) {
      setAiError(err.message || "AI rewrite failed. Please try again.");
    } finally {
      setIsShorteningAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-[3px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div>
            <div className="lbl-mono mb-1">Resume Check</div>
            <h2 className="text-base font-bold text-on-surface">
              {issues.length === 0
                ? "Your resume looks good!"
                : `${issues.length} thing${issues.length > 1 ? "s" : ""} to review`}
            </h2>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {issues.length === 0
                ? "No issues detected. Ready to export."
                : "Fix what matters before exporting, or continue anyway."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm !h-8 !w-8 !p-0 shrink-0"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Issues list */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 space-y-5">
          {issues.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✓</div>
              <p className="text-sm text-on-surface-variant">All checks passed.</p>
            </div>
          )}

          <SeverityGroup
            title="Critical"
            issues={errors}
            onAiShortenSummary={handleAiShorten}
            isShorteningAi={isShorteningAi}
            summaryRewritten={summaryRewritten}
          />
          <SeverityGroup
            title="Warnings"
            issues={warnings}
            onAiShortenSummary={handleAiShorten}
            isShorteningAi={isShorteningAi}
            summaryRewritten={summaryRewritten}
          />
          <SeverityGroup
            title="Suggestions"
            issues={suggestions}
            onAiShortenSummary={handleAiShorten}
            isShorteningAi={isShorteningAi}
            summaryRewritten={summaryRewritten}
          />

          {aiError && (
            <div className="rounded-xl p-3 text-xs text-red-400" style={{ background: "var(--bad-soft)", border: "1px solid rgba(185,28,28,0.2)" }}>
              {aiError}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t flex flex-col sm:flex-row gap-2" style={{ borderColor: "var(--border)" }}>
          <button onClick={onClose} className="btn btn-outline flex-1">
            Go back &amp; fix
          </button>
          <button
            onClick={onContinue}
            disabled={isShorteningAi}
            className="btn btn-accent flex-1 flex items-center justify-center gap-2"
          >
            <Play size={13} />
            {hasBlockers ? "Continue anyway" : "Continue to Export"}
          </button>
        </div>
      </div>
    </div>
  );
}
