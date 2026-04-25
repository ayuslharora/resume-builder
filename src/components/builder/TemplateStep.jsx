import { useResume } from "../../context/ResumeContext";
import { templateList } from "../templates";
import { ChevronRight, ChevronLeft, LayoutTemplate } from "lucide-react";

export default function TemplateStep() {
  const { nextStep, prevStep, builderData, setTemplateId } = useResume();
  const selectedTemplate = builderData.templateId;

  return (
    <div className="step-card fade-in">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-1">Choose a Template</h2>
        <p className="text-sm text-on-surface-variant">Pick the visual layout for your resume.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templateList.map(template => (
          <div 
            key={template.id}
            onClick={() => setTemplateId(template.id)}
            className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-200 border ${
              selectedTemplate === template.id 
                ? "border-primary ring-2 ring-primary/20 bg-surface-lowest scale-[1.02]" 
                : "border-surface-container-high hover:border-surface-container-highest hover:bg-surface-container"
            }`}
          >
            <div className={`h-40 w-full relative transition-opacity ${selectedTemplate === template.id ? 'opacity-100' : 'opacity-60'}`}>
              <img src={template.thumbnail} alt={`${template.name} layout preview`} className="w-full h-full object-cover object-top" />
            </div>
            
            <div className={`p-4 border-t ${
              selectedTemplate === template.id ? 'border-primary/20 bg-primary/5' : 'border-surface-container-high bg-surface-lowest'
            }`}>
              <h3 className="font-semibold text-sm text-on-surface flex items-center justify-between">
                {template.name}
                {selectedTemplate === template.id && (
                   <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed line-clamp-2">{template.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center pt-5 border-t border-surface-container-high">
        <button onClick={prevStep} className="btn-ghost">
          <ChevronLeft size={16} /> Back
        </button>
        <button 
          onClick={nextStep} 
          disabled={!selectedTemplate}
          className="btn-primary"
        >
          Next Step <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
