import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ResumeProvider } from "../context/ResumeContext";
import { useResume } from "../context/useResume";
import StepIndicator from "../components/builder/StepIndicator";
import UploadStep from "../components/builder/UploadStep";
import InterviewStep from "../components/builder/InterviewStep";
import TemplateStep from "../components/builder/TemplateStep";
import GenerateStep from "../components/builder/GenerateStep";
import EditStep from "../components/builder/EditStep";
import { ChevronLeft } from "lucide-react";

function BuilderContent() {
  const { resumeId } = useParams();
  const { loadResume, currentStep, prevStep } = useResume();

  useEffect(() => {
    loadResume(resumeId);
  }, [loadResume, resumeId]);

  useEffect(() => {
    if (currentStep === 4) {
      document.body.classList.add("builder-step-4-lock-scroll");
    } else {
      document.body.classList.remove("builder-step-4-lock-scroll");
    }

    return () => {
      document.body.classList.remove("builder-step-4-lock-scroll");
    };
  }, [currentStep]);

  return (
    <div className="flex flex-col relative">
      <div className="app-design builder-topbar sticky top-0 z-10">
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
          {currentStep >= 4 && (
            <button onClick={prevStep} className="btn-ghost shrink-0 self-start lg:self-auto">
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <div className="w-full lg:flex-1 lg:min-w-0">
            <StepIndicator currentStep={currentStep} />
          </div>
        </div>
      </div>
      <main className={`builder-form-theme flex-1 w-full px-3 py-4 sm:p-6 ${currentStep === 4 ? "pb-4 overflow-hidden" : "pb-[calc(8.5rem+env(safe-area-inset-bottom))] lg:pb-20"}`}>
        {currentStep === 1 && <InterviewStep />}
        {currentStep === 2 && <UploadStep />}
        {currentStep === 3 && <TemplateStep />}
        {currentStep === 4 && <GenerateStep />}
        {currentStep === 5 && <EditStep />}
      </main>
    </div>
  );
}

export default function Builder() {
  return (
    <ResumeProvider>
      <BuilderContent />
    </ResumeProvider>
  );
}
