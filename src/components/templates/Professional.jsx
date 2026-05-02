import EditableSection from "../resume/EditableSection";
import InlineEdit from "../resume/InlineEdit";
import PrintLink from "../resume/PrintLink";
import { Wand2 } from "lucide-react";
import { RESUME_PAGE_MIN_HEIGHT_STYLE } from "../../services/resumeLayout";

export default function Professional({ resumeData, isEditing, onSectionClick, activeSection, onUpdateSection, onRegenerate, isRegenerating, onRegenerateItem, isRegeneratingItem, onRewriteBulletRequest, onUpdateBullet, onAddBullet }) {
  if (!resumeData) return null;

  const isExpNotEmpty = (exp) => exp.role?.trim() || exp.company?.trim() || exp.duration?.trim() || exp.location?.trim() || exp.bullets?.some(b => b?.trim());
  const hasVisibleExperience = isEditing || resumeData.experience?.some(isExpNotEmpty);
  
  const isProjNotEmpty = (proj) => proj.name?.trim() || proj.link?.trim() || proj.techStack?.length > 0 || proj.bullets?.some(b => b?.trim());
  const hasVisibleProjects = isEditing || resumeData.projects?.some(isProjNotEmpty);
  
  const isEduNotEmpty = (edu) => edu.degree?.trim() || edu.field?.trim() || edu.institution?.trim() || edu.duration?.trim() || edu.cgpa?.trim();
  const hasVisibleEducation = isEditing || resumeData.education?.some(isEduNotEmpty);
  
  const hasVisibleSkills = isEditing || resumeData.skills?.technical?.some(s => s?.trim()) || resumeData.skills?.soft?.some(s => s?.trim());
  
  const hasVisibleSummary = isEditing || resumeData.summary?.trim();

  return (
    <div
      className="bg-white max-w-[850px] mx-auto text-gray-800 font-sans flex"
      style={RESUME_PAGE_MIN_HEIGHT_STYLE}
    >
      {/* Left Sidebar - Navy Blue */}
      <div className="w-[30%] bg-[#2B3A5A] text-white p-8">
        <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-8">
            <h1 className="text-2xl font-bold uppercase tracking-wider mb-4 leading-tight">
              <InlineEdit value={resumeData.personalInfo.fullName} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, fullName: v })} placeholder="Your Name" />
            </h1>
            <div className="flex flex-col gap-2 text-sm text-gray-200">
              <span className="flex items-center gap-2">✉ <InlineEdit value={resumeData.personalInfo.email} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, email: v })} placeholder="Email" /></span>
              <span className="flex items-center gap-2">☎ <InlineEdit value={resumeData.personalInfo.phone} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, phone: v })} placeholder="Phone" /></span>
              <span className="flex items-center gap-2">⚲ <InlineEdit value={resumeData.personalInfo.location} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, location: v })} placeholder="Location" /></span>
            </div>
            <div className="mt-4 text-sm flex flex-col gap-2 text-gray-300">
              <PrintLink className="break-all hover:text-white" isEditing={isEditing} href={resumeData.personalInfo.linkedin}>
                <InlineEdit value={resumeData.labels?.linkedin ?? "LinkedIn:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, linkedin: v })} /> <InlineEdit value={resumeData.personalInfo.linkedin} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, linkedin: v })} placeholder="URL" />
              </PrintLink>
              <PrintLink className="break-all hover:text-white" isEditing={isEditing} href={resumeData.personalInfo.github}>
                <InlineEdit value={resumeData.labels?.github ?? "GitHub:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, github: v })} /> <InlineEdit value={resumeData.personalInfo.github} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, github: v })} placeholder="URL" />
              </PrintLink>
            </div>
          </div>
        </EditableSection>

        {hasVisibleSummary && (
          <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-2 mb-3">
                <InlineEdit value={resumeData.labels?.summary ?? "Summary"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, summary: v })} />
              </h2>
              <p className="text-xs leading-relaxed text-gray-200">
                <InlineEdit value={resumeData.summary} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateSection('summary', v)} />
              </p>
            </div>
          </EditableSection>
        )}

        {hasVisibleSkills && (
          <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-8">
              <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-2 mb-4">
                <InlineEdit value={resumeData.labels?.skills ?? "Key Skills"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, skills: v })} />
              </h2>
              <div className="text-xs text-gray-200 space-y-4">
                {resumeData.skills.technical?.length > 0 && (
                  <div>
                    <span className="block font-bold text-white mb-2">Technical</span>
                    <ul className="list-disc list-inside space-y-1">
                      {resumeData.skills.technical.map((s, i) => (
                        <li key={i}><InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, technical: Object.assign([...resumeData.skills.technical], {[i]: v}) })} /></li>
                      ))}
                    </ul>
                  </div>
                )}
                {resumeData.skills.soft?.length > 0 && (
                  <div>
                    <span className="block font-bold text-white mb-2">Interpersonal</span>
                    <ul className="list-disc list-inside space-y-1">
                      {resumeData.skills.soft.map((s, i) => (
                        <li key={i}><InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, soft: Object.assign([...resumeData.skills.soft], {[i]: v}) })} /></li>
                      ))}
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
        {hasVisibleExperience && (
          <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">
                <InlineEdit value={resumeData.labels?.experience ?? "EXPERIENCE"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, experience: v })} />
              </h2>
              <div className="space-y-6">
                {resumeData.experience.map((exp, i) => (isEditing || isExpNotEmpty(exp)) && (
                  <div key={exp.id || `exp-${i}`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 text-sm uppercase flex items-center flex-wrap gap-2">
                        <span><InlineEdit value={exp.role} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, role: v } : e))} /></span>
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
                      <span className="text-xs font-bold text-gray-600">
                        <InlineEdit value={exp.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, duration: v } : e))} />
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm font-medium text-gray-700 italic mb-2">
                      <span><InlineEdit value={exp.company} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, company: v } : e))} /></span>
                      <span className="not-italic"><InlineEdit value={exp.location} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, location: v } : e))} /></span>
                    </div>
                    <ul className="list-disc list-outside ml-4 text-xs space-y-1.5 text-gray-700">
                      {(exp.bullets || []).map((bullet, bulletIdx) => (
                        <li key={bulletIdx}>
                          <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('experience', exp.id, bulletIdx, v) : onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, bullets: Object.assign([...(e.bullets || [])], {[bulletIdx]: v}) } : e))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('experience', exp.id, bulletIdx, v) : undefined} />
                        </li>
                      ))}
                    </ul>
                    {isEditing && onAddBullet && (
                      <button onClick={(e) => { e.stopPropagation(); onAddBullet('experience', exp.id); }} className="text-[10px] text-blue-500 hover:text-blue-600 mt-1 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider ml-4">
                        + Add Bullet
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        )}

        {hasVisibleEducation && (
          <EditableSection sectionName="education" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "education"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">
                <InlineEdit value={resumeData.labels?.education ?? "EDUCATION"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, education: v })} />
              </h2>
              <div className="space-y-4">
                {resumeData.education.map((edu, i) => (isEditing || isEduNotEmpty(edu)) && (
                  <div key={edu.id || `edu-${i}`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm text-gray-900 flex items-center flex-wrap gap-2">
                        <span><InlineEdit value={edu.degree} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, degree: v } : e))} /> <InlineEdit value={resumeData.labels?.in ?? "in"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, in: v })} /> <InlineEdit value={edu.field} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, field: v } : e))} /></span>
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
                      <span className="text-xs font-bold text-gray-600">
                        <InlineEdit value={edu.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, duration: v } : e))} />
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline text-sm text-gray-700 italic">
                      <span><InlineEdit value={edu.institution} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, institution: v } : e))} /></span>
                      {(isEditing || edu.cgpa) && (
                        <span className="not-italic text-xs font-bold">
                          <InlineEdit value={resumeData.labels?.gpa ?? "GPA:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, gpa: v })} /> <InlineEdit value={edu.cgpa} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, cgpa: v } : e))} />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        )}

        {hasVisibleProjects && (
          <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">
                <InlineEdit value={resumeData.labels?.projects ?? "PROJECTS"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, projects: v })} />
              </h2>
              <div className="space-y-6">
                {resumeData.projects.map((proj, i) => (isEditing || isProjNotEmpty(proj)) && (
                  <div key={proj.id || `proj-${i}`}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 text-sm flex items-center flex-wrap gap-2">
                        <span><InlineEdit value={proj.name} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, name: v } : p))} /></span>
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
                        {(isEditing || proj.link) && (
                          <PrintLink className="text-blue-600 text-xs font-normal" isEditing={isEditing} href={proj.link}>
                            <InlineEdit value={resumeData.labels?.link ?? "Link:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, link: v })} /> <InlineEdit value={proj.link} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, link: v } : p))} />
                          </PrintLink>
                        )}
                      </h3>
                    </div>
                    <div className="text-xs text-gray-500 font-medium mb-2">
                      <InlineEdit value={proj.techStack?.join(" • ")} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, techStack: v.split(' • ') } : p))} />
                    </div>
                    <ul className="list-disc list-outside ml-4 text-xs space-y-1.5 text-gray-700">
                      {(proj.bullets || []).map((bullet, bulletIdx) => (
                        <li key={bulletIdx}>
                          <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('projects', proj.id, bulletIdx, v) : onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, bullets: Object.assign([...(p.bullets || [])], {[bulletIdx]: v}) } : p))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('projects', proj.id, bulletIdx, v) : undefined} />
                        </li>
                      ))}
                    </ul>
                    {isEditing && onAddBullet && (
                      <button onClick={(e) => { e.stopPropagation(); onAddBullet('projects', proj.id); }} className="text-[10px] text-blue-500 hover:text-blue-600 mt-1 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider ml-4">
                        + Add Bullet
                      </button>
                    )}
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
