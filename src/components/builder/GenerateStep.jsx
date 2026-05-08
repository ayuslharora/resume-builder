import { useEffect, useState } from "react";
import { useResume } from "../../context/useResume";
import { AlertCircle, ChevronLeft } from "lucide-react";

const GENERATION_MESSAGES = [
  "Reading your achievements...",
  "Understanding your target role...",
  "Crafting your professional summary...",
  "Writing your experience bullets...",
  "Finalizing your resume..."
];

export default function GenerateStep() {
  const { builderData, setResumeData, saveNow, nextStep, prevStep } = useResume();
  const [error, setError] = useState(null);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev < GENERATION_MESSAGES.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function doGeneration() {
      try {
        const { generateResume } = await import("../../services/llm");
        const resumeData = await generateResume(builderData.bragSheetText, builderData.interviewAnswers);
        if (isMounted) {
          setResumeData(resumeData);
          await saveNow({
            resumeData,
            templateId: builderData.templateId,
            interviewAnswers: builderData.interviewAnswers,
            status: "generated",
          });
          nextStep();
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    }
    if (!builderData.resumeData && !error) {
      doGeneration();
    }
    return () => { isMounted = false; };
  }, [
    builderData.bragSheetText,
    builderData.interviewAnswers,
    builderData.resumeData,
    builderData.templateId,
    error,
    nextStep,
    saveNow,
    setResumeData,
  ]);

  return (
    <div className="h-[calc(100dvh-250px)] lg:h-[calc(100dvh-190px)] min-h-0 overflow-hidden flex items-center justify-center">
      <div
        className="w-full max-w-lg mx-auto text-center p-5 sm:p-12 rounded-2xl relative overflow-y-auto custom-scrollbar fade-in"
        style={{
          maxHeight: "100%",
          background: "var(--builder-form-surface)",
          border: "1px solid var(--builder-form-border-soft)",
          boxShadow: "0 18px 40px -28px rgba(15,15,20,0.22), 0 1px 2px rgba(15,15,20,0.04)"
        }}
      >
        <h2 className="text-2xl font-bold text-on-surface mb-3">Generating Your Resume</h2>
        <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
          Our AI is crafting your personalized resume. This may take a moment.
        </p>

        {error ? (
          <div className="p-6 rounded-2xl flex flex-col items-center"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="text-red-300 font-medium mb-6 text-sm">Error during compilation: {error}</p>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-8">
              <div className="absolute inset-0 rounded-full"
                style={{ border: "4px solid var(--builder-form-accent-border)" }} />
              <div className="absolute inset-0 rounded-full animate-spin"
                style={{ border: "4px solid transparent", borderTopColor: "var(--accent)", filter: "drop-shadow(0 0 6px color-mix(in oklch, var(--accent) 45%, transparent))" }} />
            </div>
            <p className="font-bold tracking-widest uppercase text-sm text-primary animate-pulse">
              {GENERATION_MESSAGES[msgIdx]}
            </p>
          </div>
        )}

        <div className="mt-8 pt-5 flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center"
          style={{ borderTop: "1px solid var(--builder-form-border-soft)" }}>
          <button onClick={prevStep} className="btn-ghost w-full sm:w-auto">
            <ChevronLeft size={16} /> Back
          </button>
          {error && (
            <button onClick={() => { setError(null); setMsgIdx(0); }} className="btn-primary py-3 w-full sm:w-auto">
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
