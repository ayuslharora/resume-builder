import EditableSection from "../resume/EditableSection";

export default function Modern({ resumeData, isEditing, onSectionClick, activeSection }) {
  if (!resumeData) return null;

  return (
    <div className="bg-white p-8 md:p-12 max-w-[850px] min-h-[1100px] mx-auto text-gray-800 font-sans">
      <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"}>
        <div className="border-b-[3px] border-brand-600 pb-6 mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">{resumeData.personalInfo.fullName}</h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
            {resumeData.personalInfo.email && <span className="flex items-center gap-1">✉ {resumeData.personalInfo.email}</span>}
            {resumeData.personalInfo.phone && <span className="flex items-center gap-1">☎ {resumeData.personalInfo.phone}</span>}
            {resumeData.personalInfo.location && <span className="flex items-center gap-1">⚲ {resumeData.personalInfo.location}</span>}
          </div>
          <div className="mt-2 text-sm flex gap-4">
            {resumeData.personalInfo.linkedin && <a href={resumeData.personalInfo.linkedin} className="text-brand-600 hover:underline">LinkedIn</a>}
            {resumeData.personalInfo.github && <a href={resumeData.personalInfo.github} className="text-brand-600 hover:underline">GitHub</a>}
          </div>
        </div>
      </EditableSection>

      {resumeData.summary && (
        <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"}>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Summary</h2>
            <p className="text-sm leading-relaxed text-gray-700">{resumeData.summary}</p>
          </div>
        </EditableSection>
      )}

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {resumeData.experience?.length > 0 && (
            <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-4 flex items-center gap-2">Experience</h2>
                <div className="space-y-6">
                  {resumeData.experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-900">{exp.role}</h3>
                        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-sm">{exp.duration}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-600 mt-1 mb-2">
                        {exp.company} • {exp.location}
                      </div>
                      <ul className="list-disc list-outside ml-4 text-sm space-y-1.5 text-gray-700">
                        {exp.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>
          )}

          {resumeData.projects?.length > 0 && (
            <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-4 flex items-center gap-2">Projects</h2>
                <div className="space-y-6">
                  {resumeData.projects.map(proj => (
                    <div key={proj.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-900">
                          {proj.name} 
                          {proj.link && <a href={proj.link} className="ml-2 text-brand-600 text-xs font-normal hover:underline">Link</a>}
                        </h3>
                      </div>
                      <div className="text-xs text-brand-600 font-medium mb-2">{proj.techStack?.join(" • ")}</div>
                      <ul className="list-disc list-outside ml-4 text-sm space-y-1.5 text-gray-700">
                        {proj.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>
          )}
        </div>

        <div className="col-span-1">
          {resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.soft?.length > 0) && (
            <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-3">Skills</h2>
                <div className="text-sm">
                  {resumeData.skills.technical?.length > 0 && (
                    <div className="mb-4">
                      <span className="block font-bold text-gray-900 mb-1.5">Technical</span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.skills.technical.map(s => <span key={s} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs">{s}</span>)}
                      </div>
                    </div>
                  )}
                  {resumeData.skills.soft?.length > 0 && (
                    <div>
                      <span className="block font-bold text-gray-900 mb-1.5">Interpersonal</span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.skills.soft.map(s => <span key={s} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs">{s}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </EditableSection>
          )}

          {resumeData.education?.length > 0 && (
            <EditableSection sectionName="education" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "education"}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-3">Education</h2>
                <div className="space-y-4">
                  {resumeData.education.map(edu => (
                    <div key={edu.id}>
                      <h3 className="font-bold text-sm text-gray-900">{edu.degree} in {edu.field}</h3>
                      <div className="text-xs font-medium text-gray-600 mt-1">{edu.institution}</div>
                      <div className="text-xs text-gray-500 mt-1">{edu.duration}</div>
                      {edu.cgpa && <div className="text-xs font-bold text-brand-600 mt-1">GPA: {edu.cgpa}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>
          )}
        </div>
      </div>
    </div>
  );
}
