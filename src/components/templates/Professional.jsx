import EditableSection from "../resume/EditableSection";

export default function Professional({ resumeData, isEditing, onSectionClick, activeSection }) {
  if (!resumeData) return null;

  return (
    <div className="bg-white max-w-[850px] min-h-[1100px] mx-auto text-gray-800 font-sans flex">
      {/* Left Sidebar - Navy Blue */}
      <div className="w-[30%] bg-[#2B3A5A] text-white p-8">
        <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-4 leading-tight">{resumeData.personalInfo.fullName}</h1>
            <div className="flex flex-col gap-2 text-sm text-gray-200">
              {resumeData.personalInfo.email && <span className="flex items-center gap-2">✉ {resumeData.personalInfo.email}</span>}
              {resumeData.personalInfo.phone && <span className="flex items-center gap-2">☎ {resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.location && <span className="flex items-center gap-2">⚲ {resumeData.personalInfo.location}</span>}
            </div>
            <div className="mt-4 text-sm flex flex-col gap-2 text-gray-300">
              {resumeData.personalInfo.linkedin && <a href={resumeData.personalInfo.linkedin} className="hover:text-white truncate">LinkedIn</a>}
              {resumeData.personalInfo.github && <a href={resumeData.personalInfo.github} className="hover:text-white truncate">GitHub</a>}
            </div>
          </div>
        </EditableSection>

        {resumeData.summary && (
          <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"}>
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-2 mb-3">Summary</h2>
              <p className="text-xs leading-relaxed text-gray-200">{resumeData.summary}</p>
            </div>
          </EditableSection>
        )}

        {resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.soft?.length > 0) && (
          <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"}>
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-2 mb-3">Key Skills</h2>
              <div className="text-xs text-gray-200 space-y-4">
                {resumeData.skills.technical?.length > 0 && (
                  <div>
                    <span className="block font-bold text-white mb-2">Technical</span>
                    <ul className="list-disc list-inside space-y-1">
                      {resumeData.skills.technical.map(s => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {resumeData.skills.soft?.length > 0 && (
                  <div>
                    <span className="block font-bold text-white mb-2">Interpersonal</span>
                    <ul className="list-disc list-inside space-y-1">
                      {resumeData.skills.soft.map(s => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </EditableSection>
        )}
      </div>

      {/* Right Content Area - White */}
      <div className="w-[70%] p-8">
        {resumeData.experience?.length > 0 && (
          <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"}>
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">EXPERIENCE</h2>
              <div className="space-y-6">
                {resumeData.experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 text-sm uppercase">{exp.role}</h3>
                      <span className="text-xs font-bold text-gray-600">{exp.duration}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm font-medium text-gray-700 italic mb-2">
                      <span>{exp.company}</span>
                      <span className="not-italic">{exp.location}</span>
                    </div>
                    <ul className="list-disc list-outside ml-4 text-xs space-y-1.5 text-gray-700">
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
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">EDUCATION</h2>
              <div className="space-y-4">
                {resumeData.education.map(edu => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm text-gray-900">{edu.degree} in {edu.field}</h3>
                      <span className="text-xs font-bold text-gray-600">{edu.duration}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm text-gray-700 italic">
                      <span>{edu.institution}</span>
                      {edu.cgpa && <span className="not-italic text-xs font-bold">GPA: {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        )}

        {resumeData.projects?.length > 0 && (
          <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"}>
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">PROJECTS</h2>
              <div className="space-y-6">
                {resumeData.projects.map(proj => (
                  <div key={proj.id}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 text-sm">
                        {proj.name} 
                        {proj.link && <a href={proj.link} className="ml-2 text-blue-600 text-xs font-normal hover:underline">Link</a>}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-500 font-medium mb-2">{proj.techStack?.join(" • ")}</div>
                    <ul className="list-disc list-outside ml-4 text-xs space-y-1.5 text-gray-700">
                      {proj.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        )}
      </div>
    </div>
  );
}
