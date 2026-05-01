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
          <div className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold text-primary"
            style={{ background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.18)" }}>
            {steps[currentStep - 1]}
          </div>
        </div>

        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #06b6d4, #0891b2)",
              boxShadow: "0 0 8px rgba(6,182,212,0.5)"
            }}
          />
        </div>
      </div>

      <div className="hidden lg:flex w-full max-w-3xl mx-auto items-center justify-between relative">
        <div className="absolute left-[5%] right-[5%] top-[14px] h-[2px] -z-10 rounded-full"
          style={{ background: "rgba(255,255,255,0.06)" }} />
        <div
          className="absolute left-[5%] top-[14px] h-[2px] -z-10 rounded-full transition-all duration-500"
          style={{
            width: `${progress * 0.9}%`,
            background: "linear-gradient(90deg, #06b6d4, #0891b2)",
            boxShadow: "0 0 8px rgba(6,182,212,0.5)"
          }}
        />

        {steps.map((label, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={label} className="flex flex-col items-center">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200"
                style={
                  isActive ? {
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                    border: "2px solid #06b6d4",
                    boxShadow: "0 0 12px rgba(6,182,212,0.5), 0 0 0 4px rgba(6,182,212,0.1)",
                    color: "#0c1324"
                  } : isCompleted ? {
                    background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                    border: "2px solid #06b6d4",
                    color: "#0c1324"
                  } : {
                    background: "rgba(25,31,49,0.6)",
                    backdropFilter: "blur(8px)",
                    border: "2px solid rgba(255,255,255,0.1)",
                    color: "#94a3b8"
                  }
                }
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${
                isActive ? "text-primary" : isCompleted ? "text-on-surface" : "text-on-surface-variant"
              }`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}
