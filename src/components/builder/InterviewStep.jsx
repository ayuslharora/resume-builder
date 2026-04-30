import { useResume } from "../../context/ResumeContext";

export default function InterviewStep() {
  const { nextStep, prevStep, builderData, setInterviewAnswers, saveNow } = useResume();
  const answers = builderData.interviewAnswers;

  const handleChange = (field, value) => {
    setInterviewAnswers({ [field]: value });
  };

  const handleNext = async () => {
    if (!answers.targetRole) {
      alert("Target role is required.");
      return;
    }
    await saveNow({
      interviewAnswers: answers,
      targetRole: answers.targetRole,
      title: answers.targetRole,
      status: "draft",
    });
    nextStep();
  };

  return (
    <div className="step-card fade-in">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-on-surface mb-1">Target Role Configuration</h2>
        <p className="text-sm text-on-surface-variant">Tell us what you're aiming for so we can tailor the content accordingly.</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label className="field-label">Target Role <span className="text-red-400">*</span></label>
          <input 
            type="text" 
            placeholder="e.g. Senior Frontend Engineer"
            value={answers.targetRole}
            onChange={e => handleChange('targetRole', e.target.value)} 
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Company Type (Optional)</label>
            <select value={answers.targetCompanyType} onChange={e => handleChange('targetCompanyType', e.target.value)}>
              <option value="">Unspecified</option>
              <option value="Startup">Startup</option>
              <option value="MNC">Large MNC</option>
              <option value="Product-based">Product-based</option>
              <option value="Service-based">Service-based</option>
            </select>
          </div>
          <div>
            <label className="field-label">Experience Level</label>
            <select value={answers.experienceLevel} onChange={e => handleChange('experienceLevel', e.target.value)}>
              <option value="">Select Tier</option>
              <option value="Fresher">Entry-Level</option>
              <option value="Completed 1 internship">1 Internship</option>
              <option value="Multiple internships">Multiple Internships</option>
              <option value="Associate">1-3 Years</option>
              <option value="Mid">3-5 Years</option>
              <option value="Senior">5+ Years</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label">Key Skills to Highlight</label>
          <textarea 
            rows="2"
            placeholder="e.g. React.js, Distributed Systems, CI/CD"
            value={answers.skillsToHighlight}
            onChange={e => handleChange('skillsToHighlight', e.target.value)}
            className="custom-scrollbar"
          />
        </div>

        <div>
          <label className="field-label">Career Objective (Optional)</label>
          <textarea 
            rows="2"
            placeholder="Describe your unique value proposition..."
            value={answers.careerObjective}
            onChange={e => handleChange('careerObjective', e.target.value)}
            className="custom-scrollbar"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Technologies to Emphasize</label>
            <input 
              type="text"
              value={answers.technologiesToEmphasize}
              onChange={e => handleChange('technologiesToEmphasize', e.target.value)} 
              placeholder="e.g. AWS, Node.js, GraphQL"
            />
          </div>
          <div>
            <label className="field-label">Resume Length</label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:text-on-surface">
                <input type="radio" name="length" value="1-page" className="accent-primary" checked={answers.preferredLength === "1-page"} onChange={e => handleChange('preferredLength', e.target.value)} /> 
                1 Page
              </label>
              <label className="flex items-center gap-2 text-sm text-on-surface-variant cursor-pointer hover:text-on-surface">
                <input type="radio" name="length" value="2-pages" className="accent-primary" checked={answers.preferredLength === "2-pages"} onChange={e => handleChange('preferredLength', e.target.value)} /> 
                2 Pages
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-5 border-t border-surface-container-high flex justify-between items-center">
        <button onClick={prevStep} className="btn-ghost" disabled>
          Cancel
        </button>
        <button onClick={handleNext} className="btn-primary">
          Save & Next
        </button>
      </div>
    </div>
  );
}
