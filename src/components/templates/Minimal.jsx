import EditableSection from "../resume/EditableSection";

export default function Minimal({ resumeData, isEditing, onSectionClick, activeSection }) {
  if (!resumeData) return null;

  return (
    <div className="bg-white p-8 md:p-12 max-w-[850px] min-h-[1100px] mx-auto text-gray-900 font-sans">
      <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"}>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-wide">{resumeData.personalInfo.fullName}</h1>
          <div className="mt-2 text-sm space-x-2 text-gray-600">
            {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
            {resumeData.personalInfo.phone && <span>• {resumeData.personalInfo.phone}</span>}
            {resumeData.personalInfo.location && <span>• {resumeData.personalInfo.location}</span>}
          </div>
          <div className="mt-1 text-sm space-x-2 text-gray-600">
            {resumeData.personalInfo.linkedin && <a href={resumeData.personalInfo.linkedin} className="text-blue-600">LinkedIn</a>}
            {resumeData.personalInfo.github && <span>• <a href={resumeData.personalInfo.github} className="text-blue-600">GitHub</a></span>}
          </div>
        </div>
      </EditableSection>

      {resumeData.summary && (
        <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-2">Professional Summary</h2>
            <p className="text-sm leading-relaxed">{resumeData.summary}</p>
          </div>
        </EditableSection>
      )}

      {resumeData.experience?.length > 0 && (
        <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">Experience</h2>
            <div className="space-y-4">
              {resumeData.experience.map(exp => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base">{exp.role}</h3>
                    <span className="text-sm text-gray-600">{exp.duration}</span>
                  </div>
                  <div className="flex justify-between items-baseline mb-2 text-sm text-gray-800">
                    <span className="font-medium italic">{exp.company}</span>
                    <span>{exp.location}</span>
                  </div>
                  <ul className="list-disc list-outside ml-4 text-sm space-y-1">
                    {exp.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </EditableSection>
      )}

      {resumeData.education?.length > 0 && (
        <EditableSection sectionName="education" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "education"}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">Education</h2>
            <div className="space-y-4">
              {resumeData.education.map(edu => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base">{edu.degree} in {edu.field}</h3>
                    <span className="text-sm text-gray-600">{edu.duration}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm text-gray-800">
                    <span className="font-medium italic">{edu.institution}</span>
                    {edu.cgpa && <span>GPA: {edu.cgpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EditableSection>
      )}

      {resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.soft?.length > 0) && (
        <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">Skills</h2>
            <div className="text-sm">
              {resumeData.skills.technical?.length > 0 && (
                <div className="mb-1"><span className="font-bold mr-2">Technical:</span>{resumeData.skills.technical.join(", ")}</div>
              )}
              {resumeData.skills.soft?.length > 0 && (
                <div><span className="font-bold mr-2">Soft:</span>{resumeData.skills.soft.join(", ")}</div>
              )}
            </div>
          </div>
        </EditableSection>
      )}

      {resumeData.projects?.length > 0 && (
        <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">Projects</h2>
            <div className="space-y-4">
              {resumeData.projects.map(proj => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base flex items-center gap-2">
                      {proj.name} 
                      {proj.link && <a href={proj.link} className="text-blue-600 text-xs font-normal">Link</a>}
                    </h3>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">{proj.techStack?.join(", ")}</div>
                  <ul className="list-disc list-outside ml-4 text-sm space-y-1">
                    {proj.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </EditableSection>
      )}
    </div>
  );
}
