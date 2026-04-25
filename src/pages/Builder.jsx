import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { ResumeProvider, useResume } from "../context/ResumeContext";
import StepIndicator from "../components/builder/StepIndicator";
import UploadStep from "../components/builder/UploadStep";
import InterviewStep from "../components/builder/InterviewStep";
import TemplateStep from "../components/builder/TemplateStep";
import GenerateStep from "../components/builder/GenerateStep";
import EditStep from "../components/builder/EditStep";

function BuilderContent() {
  const { resumeId } = useParams();
  const { loadResume, currentStep } = useResume();

  useEffect(() => {
    loadResume(resumeId);
  }, [resumeId]);

  return (
    <div className="flex flex-col relative">
      <div className="glass-card border-b ghost-border border-x-0 border-t-0 py-4 px-4 sm:py-5 sm:px-6 sticky top-16 lg:top-0 z-10">
         <StepIndicator currentStep={currentStep} />
      </div>
      <main className="flex-1 w-full p-4 sm:p-6 pb-16 sm:pb-20 overflow-y-auto custom-scrollbar">
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
