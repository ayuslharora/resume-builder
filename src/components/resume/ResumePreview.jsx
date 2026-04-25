import { Suspense } from "react";
import { templates } from "../templates";

export default function ResumePreview({ resumeData, templateId, isEditing, onSectionClick, activeSection, scale = 0.85 }) {
  if (!templateId || !templates[templateId]) return <div className="p-10 text-center text-gray-500">No template selected</div>;

  const { component: TemplateComponent } = templates[templateId];

  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-gray-400 animate-pulse">Loading template...</div>}>
      <div className="shadow-lg origin-top bg-white" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
        <TemplateComponent
          resumeData={resumeData}
          isEditing={isEditing}
          onSectionClick={onSectionClick}
          activeSection={activeSection}
        />
      </div>
    </Suspense>
  );
}
