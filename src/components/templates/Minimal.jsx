import EditableSection from "../resume/EditableSection";
import InlineEdit from "../resume/InlineEdit";
import PrintLink from "../resume/PrintLink";
import { Wand2 } from "lucide-react";
import ItemReorderButtons from "../resume/ItemReorderButtons";
import { RESUME_PAGE_MIN_HEIGHT_STYLE } from "../../services/resumeLayout";

export default function Minimal({ resumeData, isEditing, onSectionClick, activeSection, onUpdateSection, onRegenerate, isRegenerating, onRegenerateItem, isRegeneratingItem, onRewriteBulletRequest, onUpdateBullet, onAddBullet, onReorderItem }) {
  if (!resumeData) return null;

  const isExpNotEmpty = (exp) => exp.role?.toString()?.trim() || exp.company?.toString()?.trim() || exp.duration?.toString()?.trim() || exp.location?.toString()?.trim() || exp.bullets?.some(b => b?.toString()?.trim());
  const hasVisibleExperience = isEditing || resumeData.experience?.some(isExpNotEmpty);

  const isProjNotEmpty = (proj) => proj.name?.toString()?.trim() || proj.link?.toString()?.trim() || proj.techStack?.length > 0 || proj.bullets?.some(b => b?.toString()?.trim());
  const hasVisibleProjects = isEditing || resumeData.projects?.some(isProjNotEmpty);

  const isEduNotEmpty = (edu) => edu.degree?.toString()?.trim() || edu.field?.toString()?.trim() || edu.institution?.toString()?.trim() || edu.duration?.toString()?.trim() || edu.cgpa?.toString()?.trim();
  const hasVisibleEducation = isEditing || resumeData.education?.some(isEduNotEmpty);

  const hasVisibleSkills = isEditing || resumeData.skills?.technical?.some(s => s?.toString()?.trim()) || resumeData.skills?.soft?.some(s => s?.toString()?.trim());

  const hasVisibleSummary = isEditing || resumeData.summary?.toString()?.trim();

  return (
    <div className="resume-template-root bg-white p-8 md:p-12 max-w-[850px] mx-auto text-gray-900 font-sans" style={{ ...RESUME_PAGE_MIN_HEIGHT_STYLE, fontFamily: 'inherit' }}>
      <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold uppercase tracking-wide">
            <InlineEdit value={resumeData.personalInfo.fullName} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, fullName: v })} placeholder="Your Name" />
          </h1>
          <div className="mt-2 text-sm space-x-2 text-gray-600">
            <span className="flex items-center gap-1 justify-center inline-flex">
              <PrintLink className="hover:underline" isEditing={isEditing} href={resumeData.personalInfo.email ? `mailto:${resumeData.personalInfo.email}` : ""}><InlineEdit value={resumeData.personalInfo.email} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, email: v })} placeholder="Email" /></PrintLink>
              <span className="mx-1"><InlineEdit value={resumeData.labels?.separator ?? "•"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, separator: v })} /></span>
              <PrintLink className="hover:underline" isEditing={isEditing} href={resumeData.personalInfo.phone ? `tel:${resumeData.personalInfo.phone}` : ""}><InlineEdit value={resumeData.personalInfo.phone} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, phone: v })} placeholder="Phone" /></PrintLink>
              <span className="mx-1"><InlineEdit value={resumeData.labels?.separator ?? "•"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, separator: v })} /></span>
              <InlineEdit value={resumeData.personalInfo.location} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, location: v })} placeholder="Location" />
            </span>
          </div>
          <div className="mt-1 text-sm space-x-2 text-gray-600">
            <span className="inline-flex gap-2 justify-center">
              <PrintLink className="text-blue-600" isEditing={isEditing} href={resumeData.personalInfo.linkedin}>
                <InlineEdit value={resumeData.personalInfo.linkedin} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, linkedin: v })} placeholder="LinkedIn URL" />
              </PrintLink>
              <span className="mx-1"><InlineEdit value={resumeData.labels?.separator ?? "•"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, separator: v })} /></span>
              <PrintLink className="text-blue-600" isEditing={isEditing} href={resumeData.personalInfo.github}>
                <InlineEdit value={resumeData.personalInfo.github} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, github: v })} placeholder="GitHub URL" />
              </PrintLink>
            </span>
          </div>
        </div>
      </EditableSection>

      {hasVisibleSummary && (
        <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">
              <InlineEdit value={resumeData.labels?.summary ?? "Professional Summary"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, summary: v })} />
            </h2>
            <p className="text-sm leading-relaxed">
              <InlineEdit value={resumeData.summary} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateSection('summary', v)} />
            </p>
          </div>
        </EditableSection>
      )}

      {hasVisibleExperience && (
        <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">
              <InlineEdit value={resumeData.labels?.experience ?? "Experience"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, experience: v })} />
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, i) => (isEditing || isExpNotEmpty(exp)) && (
                <div key={exp.id || `exp-${i}`}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base flex items-center flex-wrap gap-2">
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
                      {isEditing && activeSection === "experience" && onReorderItem && (
                        <ItemReorderButtons index={i} total={resumeData.experience.length} onMove={(from, to) => onReorderItem('experience', from, to)} />
                      )}
                    </h3>
                    <span className="text-sm text-gray-600">
                      <InlineEdit value={exp.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, duration: v } : e))} />
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mb-2 text-sm text-gray-800">
                    <span className="font-medium italic">
                      <InlineEdit value={exp.company} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, company: v } : e))} />
                    </span>
                    <span>
                      <InlineEdit value={exp.location} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, location: v } : e))} />
                    </span>
                  </div>
                  <ul className="list-disc list-outside ml-4 text-sm space-y-1">
                    {(exp.bullets || []).map((bullet, bulletIdx) => (
                      <li key={bulletIdx}>
                        <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('experience', exp.id, bulletIdx, v) : onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, bullets: Object.assign([...(e.bullets || [])], { [bulletIdx]: v }) } : e))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('experience', exp.id, bulletIdx, v) : undefined} />
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
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">
              <InlineEdit value={resumeData.labels?.education ?? "Education"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, education: v })} />
            </h2>
            <div className="space-y-4">
              {resumeData.education.map((edu, i) => (isEditing || isEduNotEmpty(edu)) && (
                <div key={edu.id || `edu-${i}`}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base flex items-center flex-wrap gap-2">
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
                      {isEditing && activeSection === "education" && onReorderItem && (
                        <ItemReorderButtons index={i} total={resumeData.education.length} onMove={(from, to) => onReorderItem('education', from, to)} />
                      )}
                    </h3>
                    <span className="text-sm text-gray-600">
                      <InlineEdit value={edu.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, duration: v } : e))} />
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-sm text-gray-800">
                    <span className="font-medium italic">
                      <InlineEdit value={edu.institution} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, institution: v } : e))} />
                    </span>
                    <div className="text-sm">
                      {(isEditing || edu.cgpa) && (
                        <span><InlineEdit value={resumeData.labels?.gpa ?? "GPA:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, gpa: v })} /> <InlineEdit value={edu.cgpa} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, cgpa: v } : e))} /></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </EditableSection>
      )}

      {hasVisibleSkills && (
        <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">
              <InlineEdit value={resumeData.labels?.skills ?? "Skills"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, skills: v })} />
            </h2>
            <div className="text-sm">
              {(isEditing || resumeData.skills.technical?.some(s => s?.toString()?.trim())) && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-bold mr-1">
                    <InlineEdit value={resumeData.labels?.technical ?? "Technical:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, technical: v })} />
                  </span>
                  {(resumeData.skills.technical || []).map((s, i) => (isEditing || s?.toString()?.trim()) && (
                    <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                      <InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, technical: Object.assign([...resumeData.skills.technical], { [i]: v }) })} />
                    </span>
                  ))}
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = resumeData.skills.technical || [];
                        onUpdateSection('skills', { ...resumeData.skills, technical: [...current, "New Skill"] });
                      }}
                      className="text-[10px] text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-200 px-3 py-1 rounded-full uppercase font-bold tracking-wider transition-colors"
                    >
                      + Add
                    </button>
                  )}
                </div>
              )}
              {(isEditing || resumeData.skills.soft?.some(s => s?.toString()?.trim())) && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold mr-1">
                    <InlineEdit value={resumeData.labels?.soft ?? "Soft:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, soft: v })} />
                  </span>
                  {(resumeData.skills.soft || []).map((s, i) => (isEditing || s?.toString()?.trim()) && (
                    <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                      <InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, soft: Object.assign([...resumeData.skills.soft], { [i]: v }) })} />
                    </span>
                  ))}
                  {isEditing && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const current = resumeData.skills.soft || [];
                        onUpdateSection('skills', { ...resumeData.skills, soft: [...current, "New Skill"] });
                      }}
                      className="text-[10px] text-gray-500 hover:text-gray-800 bg-gray-50 hover:bg-gray-200 px-3 py-1 rounded-full uppercase font-bold tracking-wider transition-colors"
                    >
                      + Add
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </EditableSection>
      )}

      {hasVisibleProjects && (
        <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b border-black pb-1 mb-3">
              <InlineEdit value={resumeData.labels?.projects ?? "Projects"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, projects: v })} />
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((proj, i) => (isEditing || isProjNotEmpty(proj)) && (
                <div key={proj.id || `proj-${i}`}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-base flex items-center flex-wrap gap-2">
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
                      {isEditing && activeSection === "projects" && onReorderItem && (
                        <ItemReorderButtons index={i} total={resumeData.projects.length} onMove={(from, to) => onReorderItem('projects', from, to)} />
                      )}
                      {(isEditing || proj.link) && (
                        <PrintLink className="text-blue-600 text-xs font-normal" isEditing={isEditing} href={proj.link}>
                          <InlineEdit value={resumeData.labels?.link ?? "Link:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, link: v })} /> <InlineEdit value={proj.link} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, link: v } : p))} />
                        </PrintLink>
                      )}
                    </h3>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    <InlineEdit value={(Array.isArray(proj.techStack) ? proj.techStack : []).join(" • ")} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, techStack: v.split(' • ') } : p))} />
                  </div>
                  <ul className="list-disc list-outside ml-4 text-sm space-y-1">
                    {(proj.bullets || []).map((bullet, bulletIdx) => (
                      <li key={bulletIdx}>
                        <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('projects', proj.id, bulletIdx, v) : onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, bullets: Object.assign([...(p.bullets || [])], { [bulletIdx]: v }) } : p))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('projects', proj.id, bulletIdx, v) : undefined} />
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
  );
}
