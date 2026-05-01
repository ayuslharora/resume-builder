import EditableSection from "../resume/EditableSection";
import InlineEdit from "../resume/InlineEdit";
import { Wand2 } from "lucide-react";

export default function Modern({ resumeData, isEditing, onSectionClick, activeSection, onUpdateSection, onRegenerate, isRegenerating, onRegenerateItem, isRegeneratingItem }) {
  if (!resumeData) return null;

  return (
    <div className="bg-white p-8 md:p-12 max-w-[850px] min-h-[1100px] mx-auto text-gray-800 font-sans">
      <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
        <div className="border-b-[3px] border-brand-600 pb-6 mb-6">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            <InlineEdit 
              value={resumeData.personalInfo.fullName} 
              isEditing={isEditing} 
              onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, fullName: v })} 
              placeholder="Your Name"
            />
          </h1>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
            <span className="flex items-center gap-1">✉ <InlineEdit value={resumeData.personalInfo.email} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, email: v })} placeholder="Email" /></span>
            <span className="flex items-center gap-1">☎ <InlineEdit value={resumeData.personalInfo.phone} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, phone: v })} placeholder="Phone" /></span>
            <span className="flex items-center gap-1">⚲ <InlineEdit value={resumeData.personalInfo.location} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, location: v })} placeholder="Location" /></span>
          </div>
          <div className="mt-2 text-sm flex gap-4">
            <span className="text-brand-600"><InlineEdit value={resumeData.labels?.linkedin ?? "LinkedIn:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, linkedin: v })} /> <InlineEdit value={resumeData.personalInfo.linkedin} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, linkedin: v })} placeholder="URL" /></span>
            <span className="text-brand-600"><InlineEdit value={resumeData.labels?.github ?? "GitHub:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, github: v })} /> <InlineEdit value={resumeData.personalInfo.github} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, github: v })} placeholder="URL" /></span>
          </div>
        </div>
      </EditableSection>

      {resumeData.summary && (
        <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              <InlineEdit value={resumeData.labels?.summary ?? "Summary"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, summary: v })} />
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              <InlineEdit 
                value={resumeData.summary} 
                isEditing={isEditing} 
                multiline={true}
                onChange={(v) => onUpdateSection('summary', v)} 
              />
            </p>
          </div>
        </EditableSection>
      )}

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2">
          {resumeData.experience?.length > 0 && (
            <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-4 flex items-center gap-2">
                  <InlineEdit value={resumeData.labels?.experience ?? "Experience"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, experience: v })} />
                </h2>
                <div className="space-y-6">
                  {resumeData.experience.map((exp, i) => (
                    <div key={exp.id || `exp-${i}`}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-gray-900 flex items-center flex-wrap gap-2">
                          <span><InlineEdit value={exp.role} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, role: v } : e))} /></span>
                          {isEditing && activeSection === "experience" && onRegenerateItem && (
                            <button
                              disabled={isRegeneratingItem === `experience-${i}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRegenerateItem('experience', i);
                              }}
                              className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors disabled:opacity-50 ml-1"
                              title="Rewrite this experience with AI"
                            >
                              <Wand2 size={12} className={isRegeneratingItem === `experience-${i}` ? "animate-pulse" : ""} />
                            </button>
                          )}
                        </h3>
                        <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-sm">
                          <InlineEdit value={exp.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, duration: v } : e))} />
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-600 mt-1 mb-2">
                        <InlineEdit value={exp.company} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, company: v } : e))} /> <InlineEdit value={resumeData.labels?.separator ?? "•"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, separator: v })} /> <InlineEdit value={exp.location} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, location: v } : e))} />
                      </div>
                      <ul className="list-disc list-outside ml-4 text-sm space-y-1.5 text-gray-700">
                        {(exp.bullets || []).map((bullet, i) => (
                          <li key={i}>
                            <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, bullets: Object.assign([...(e.bullets || [])], {[i]: v}) } : e))} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </EditableSection>
          )}

          {resumeData.projects?.length > 0 && (
            <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-4 flex items-center gap-2">
                  <InlineEdit value={resumeData.labels?.projects ?? "Projects"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, projects: v })} />
                </h2>
                <div className="space-y-6">
                  {resumeData.projects.map((proj, i) => (
                    <div key={proj.id || `proj-${i}`}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-gray-900 flex items-center flex-wrap gap-2">
                          <span><InlineEdit value={proj.name} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map(p => p.id === proj.id ? { ...p, name: v } : p))} /></span>
                          {isEditing && activeSection === "projects" && onRegenerateItem && (
                            <button
                              disabled={isRegeneratingItem === `projects-${i}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onRegenerateItem('projects', i);
                              }}
                              className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors disabled:opacity-50 ml-1"
                              title="Rewrite this project with AI"
                            >
                              <Wand2 size={12} className={isRegeneratingItem === `projects-${i}` ? "animate-pulse" : ""} />
                            </button>
                          )}
                          <span className="text-brand-600 text-xs font-normal">
                            <InlineEdit value={resumeData.labels?.link ?? "Link:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, link: v })} /> <InlineEdit value={proj.link} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map(p => p.id === proj.id ? { ...p, link: v } : p))} />
                          </span>
                        </h3>
                      </div>
                      <div className="text-xs text-brand-600 font-medium mb-2">
                        <InlineEdit value={proj.techStack?.join(" • ")} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map(p => p.id === proj.id ? { ...p, techStack: v.split(' • ') } : p))} />
                      </div>
                      <ul className="list-disc list-outside ml-4 text-sm space-y-1.5 text-gray-700">
                        {(proj.bullets || []).map((bullet, i) => (
                          <li key={i}>
                            <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map(p => p.id === proj.id ? { ...p, bullets: Object.assign([...(p.bullets || [])], {[i]: v}) } : p))} />
                          </li>
                        ))}
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
            <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-3">
                  <InlineEdit value={resumeData.labels?.skills ?? "Skills"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, skills: v })} />
                </h2>
                <div className="text-sm">
                  {resumeData.skills.technical?.length > 0 && (
                    <div className="mb-4">
                      <span className="block font-bold text-gray-900 mb-1.5">
                        <InlineEdit value={resumeData.labels?.technical ?? "Technical"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, technical: v })} />
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.skills.technical.map((s, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs">
                            <InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, technical: Object.assign([...resumeData.skills.technical], {[i]: v}) })} />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeData.skills.soft?.length > 0 && (
                    <div>
                      <span className="block font-bold text-gray-900 mb-1.5">
                        <InlineEdit value={resumeData.labels?.soft ?? "Interpersonal"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, soft: v })} />
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {resumeData.skills.soft.map((s, i) => (
                          <span key={i} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded text-xs">
                            <InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, soft: Object.assign([...resumeData.skills.soft], {[i]: v}) })} />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </EditableSection>
          )}

          {resumeData.education?.length > 0 && (
            <EditableSection sectionName="education" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "education"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
              <div className="mb-8">
                <h2 className="text-lg font-bold text-brand-600 mb-3">
                  <InlineEdit value={resumeData.labels?.education ?? "Education"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, education: v })} />
                </h2>
                <div className="space-y-4">
                  {resumeData.education.map((edu, i) => (
                    <div key={edu.id || `edu-${i}`}>
                      <h3 className="font-bold text-sm text-gray-900 flex items-center flex-wrap gap-2">
                        <span><InlineEdit value={edu.degree} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, degree: v } : e))} /> <InlineEdit value={resumeData.labels?.in ?? "in"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, in: v })} /> <InlineEdit value={edu.field} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, field: v } : e))} /></span>
                        {isEditing && activeSection === "education" && onRegenerateItem && (
                          <button
                            disabled={isRegeneratingItem === `education-${i}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onRegenerateItem('education', i);
                            }}
                            className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors disabled:opacity-50 ml-1"
                            title="Rewrite this education with AI"
                          >
                            <Wand2 size={12} className={isRegeneratingItem === `education-${i}` ? "animate-pulse" : ""} />
                          </button>
                        )}
                      </h3>
                      <div className="text-xs font-medium text-gray-600 mt-1">
                        <InlineEdit value={edu.institution} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, institution: v } : e))} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <InlineEdit value={edu.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, duration: v } : e))} />
                      </div>
                      <div className="text-xs font-bold text-brand-600 mt-1">
                        <InlineEdit value={resumeData.labels?.gpa ?? "GPA:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, gpa: v })} /> <InlineEdit value={edu.cgpa} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, cgpa: v } : e))} />
                      </div>
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
