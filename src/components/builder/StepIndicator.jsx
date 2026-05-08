export default function StepIndicator({ currentStep }) {
  const steps = ["Config", "Upload", "Design", "Refine", "Export"];
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <>
      <div className="lg:hidden w-full">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              Resume Builder
            </p>
            <p className="text-sm font-semibold text-on-surface">
              Step {currentStep} of {steps.length}
            </p>
          </div>
          <div
            className="builder-step-chip shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary"
            style={{ background: "var(--builder-step-active-soft)", border: "1px solid var(--builder-step-active-border)" }}
          >
            {steps[currentStep - 1]}
          </div>
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--builder-step-track)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "var(--accent, #2563eb)"
            }}
          />
        </div>
      </div>

      <div className="builder-step-timeline hidden lg:flex w-full max-w-3xl mx-auto items-center justify-between relative">
        <div className="builder-step-rail" aria-hidden="true">
          <div
            className="builder-step-rail-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div
              key={label}
              className="builder-step"
              data-state={isActive ? "active" : isCompleted ? "completed" : "upcoming"}
            >
              <div className="builder-step-node">
                {isCompleted ? "✓" : stepNum}
              </div>
              <span className="builder-step-label">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
