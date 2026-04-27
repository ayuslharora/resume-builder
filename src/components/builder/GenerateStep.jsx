import { useEffect, useState } from "react";
import { useResume } from "../../context/ResumeContext";
import { generateResume } from "../../services/groq";
import { AlertCircle } from "lucide-react";

export default function GenerateStep() {
  const { builderData, setResumeData, nextStep, prevStep } = useResume();
  const [error, setError] = useState(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = [
    "Reading your achievements...",
    "Understanding your target role...",
    "Crafting your professional summary...",
    "Writing your experience bullets...",
    "Finalizing your resume..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => (prev < messages.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function doGeneration() {
      try {
        const resumeData = await generateResume(builderData.bragSheetText, builderData.interviewAnswers);
        if (isMounted) { setResumeData(resumeData); nextStep(); }
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    }
    if (!builderData.resumeData && !error) doGeneration();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="max-w-lg mx-auto mt-10 text-center p-6 sm:p-12 rounded-2xl relative overflow-hidden fade-in"
      style={{
        background: "rgba(25,31,49,0.55)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)"
      }}>

      {/* Ambient orb */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none -z-10"
        style={{ background: "rgba(6,182,212,0.07)", filter: "blur(60px)" }} />

      <h2 className="text-2xl font-bold text-on-surface mb-3">Generating Your Resume</h2>
      <p className="text-on-surface-variant mb-8 text-sm leading-relaxed">
        Our AI is crafting your personalized resume. This may take a moment.
      </p>

      {error ? (
        <div className="p-6 rounded-2xl flex flex-col items-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <p className="text-red-300 font-medium mb-6 text-sm">Error during compilation: {error}</p>
          <div className="flex w-full gap-4">
            <button onClick={prevStep} className="flex-1 btn-ghost py-3">Back</button>
            <button onClick={() => { setError(null); setMsgIdx(0); }} className="flex-1 btn-primary py-3">Retry</button>
          </div>
        </div>
      ) : (
        <div className="h-48 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-8">
            <div className="absolute inset-0 rounded-full"
              style={{ border: "4px solid rgba(6,182,212,0.12)" }} />
            <div className="absolute inset-0 rounded-full animate-spin"
              style={{ border: "4px solid transparent", borderTopColor: "#06b6d4", filter: "drop-shadow(0 0 6px rgba(6,182,212,0.5))" }} />
          </div>
          <p className="font-bold tracking-widest uppercase text-sm text-primary animate-pulse">
            {messages[msgIdx]}
          </p>
        </div>
      )}
    </div>
  );
}
