import EditableSection from "../resume/EditableSection";
import InlineEdit from "../resume/InlineEdit";
import PrintLink from "../resume/PrintLink";
import { Wand2 } from "lucide-react";
import { RESUME_PAGE_MIN_HEIGHT_STYLE } from "../../services/resumeLayout";

export default function Modern({ resumeData, isEditing, onSectionClick, activeSection, onUpdateSection, onRegenerate, isRegenerating, onRegenerateItem, isRegeneratingItem, onRewriteBulletRequest, onUpdateBullet, onAddBullet }) {
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
      className="flex bg-[#1c252e] max-w-[850px] mx-auto text-slate-300 font-sans shadow-2xl"
      style={RESUME_PAGE_MIN_HEIGHT_STYLE}
    >
      {/* Left Sidebar - Dark Slate */}
      <div className="w-[35%] bg-[#2d3740] text-slate-200 p-8 flex flex-col gap-8">
        <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-2 border-b-2 border-blue-500 pb-6">
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight mb-4">
              <InlineEdit value={resumeData.personalInfo.fullName} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, fullName: v })} placeholder="Your Name" />
            </h1>
            <div className="flex flex-col gap-3 text-sm text-slate-300">
              <span className="flex items-center gap-2"><span className="text-blue-400">✉</span> <InlineEdit value={resumeData.personalInfo.email} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, email: v })} placeholder="Email" /></span>
              <span className="flex items-center gap-2"><span className="text-blue-400">☎</span> <InlineEdit value={resumeData.personalInfo.phone} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, phone: v })} placeholder="Phone" /></span>
              <span className="flex items-center gap-2"><span className="text-blue-400">⚲</span> <InlineEdit value={resumeData.personalInfo.location} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, location: v })} placeholder="Location" /></span>
            </div>
            <div className="mt-5 flex flex-col gap-2 text-sm text-slate-400">
              <PrintLink className="break-all hover:text-white transition-colors" isEditing={isEditing} href={resumeData.personalInfo.linkedin}>
                <InlineEdit value={resumeData.labels?.linkedin ?? "LinkedIn:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, linkedin: v })} /> <span className="text-blue-400"><InlineEdit value={resumeData.personalInfo.linkedin} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, linkedin: v })} placeholder="URL" /></span>
              </PrintLink>
              <PrintLink className="break-all hover:text-white transition-colors" isEditing={isEditing} href={resumeData.personalInfo.github}>
                <InlineEdit value={resumeData.labels?.github ?? "GitHub:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, github: v })} /> <span className="text-blue-400"><InlineEdit value={resumeData.personalInfo.github} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, github: v })} placeholder="URL" /></span>
              </PrintLink>
            </div>
          </div>
        </EditableSection>

        {hasVisibleSummary && (
          <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                <InlineEdit value={resumeData.labels?.summary ?? "Summary"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, summary: v })} />
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                <InlineEdit value={resumeData.summary} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateSection('summary', v)} />
              </p>
            </div>
          </EditableSection>
        )}

        {hasVisibleSkills && (
          <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                <InlineEdit value={resumeData.labels?.skills ?? "Skills"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, skills: v })} />
              </h2>
              <div className="text-sm space-y-4">
                {(isEditing || resumeData.skills.technical?.length > 0) && (
                  <div>
                    <span className="block font-bold text-white mb-2">
                      <InlineEdit value={resumeData.labels?.technical ?? "Technical"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, technical: v })} />
                    </span>
                    <div className="flex flex-wrap gap-2 items-center">
                      {(resumeData.skills.technical || []).map((s, i) => (
                        <span key={i} className="bg-[#1c252e] text-slate-300 px-3 py-1 rounded border border-slate-700/50 shadow-sm">
                          <InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, technical: Object.assign([...resumeData.skills.technical], {[i]: v}) })} />
                        </span>
                      ))}
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = resumeData.skills.technical || [];
                            onUpdateSection('skills', { ...resumeData.skills, technical: [...current, "New Skill"] });
                          }}
                          className="bg-[#1c252e] text-blue-400 px-3 py-1 rounded border border-slate-700/50 shadow-sm opacity-50 hover:opacity-100 transition-opacity uppercase text-[10px] font-bold tracking-wider"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {(isEditing || resumeData.skills.soft?.length > 0) && (
                  <div>
                    <span className="block font-bold text-white mb-2">
                      <InlineEdit value={resumeData.labels?.soft ?? "Interpersonal"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, soft: v })} />
                    </span>
                    <div className="flex flex-wrap gap-2 items-center">
                      {(resumeData.skills.soft || []).map((s, i) => (
                        <span key={i} className="bg-[#1c252e] text-slate-300 px-3 py-1 rounded border border-slate-700/50 shadow-sm">
                          <InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, soft: Object.assign([...resumeData.skills.soft], {[i]: v}) })} />
                        </span>
                      ))}
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = resumeData.skills.soft || [];
                            onUpdateSection('skills', { ...resumeData.skills, soft: [...current, "New Skill"] });
                          }}
                          className="bg-[#1c252e] text-blue-400 px-3 py-1 rounded border border-slate-700/50 shadow-sm opacity-50 hover:opacity-100 transition-opacity uppercase text-[10px] font-bold tracking-wider"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </EditableSection>
        )}
        
        {hasVisibleEducation && (
          <EditableSection sectionName="education" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "education"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4 flex items-center gap-2">
                <InlineEdit value={resumeData.labels?.education ?? "Education"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, education: v })} />
              </h2>
              <div className="space-y-5">
                {resumeData.education.map((edu, i) => (isEditing || isEduNotEmpty(edu)) && (
                  <div key={edu.id || `edu-${i}`} className="relative pl-4 before:absolute before:left-0 before:top-1.5 before:w-1.5 before:h-1.5 before:bg-blue-500 before:rounded-full">
                    <h3 className="font-bold text-sm text-white flex items-center flex-wrap gap-2">
                      <span><InlineEdit value={edu.degree} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, degree: v } : e))} /> <span className="font-normal text-slate-400"><InlineEdit value={resumeData.labels?.in ?? "in"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, in: v })} /></span> <InlineEdit value={edu.field} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, field: v } : e))} /></span>
                      {isEditing && activeSection === "education" && onRegenerateItem && (
                        <button disabled={isRegeneratingItem === `education-${i}`} onClick={(e) => { e.stopPropagation(); onRegenerateItem('education', i); }} className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-blue-400 p-1 rounded-full transition-colors disabled:opacity-50 ml-1" title="Rewrite this education with AI"><Wand2 size={12} className={isRegeneratingItem === `education-${i}` ? "animate-pulse" : ""} /></button>
                      )}
                    </h3>
                    <div className="text-sm font-medium text-blue-300 mt-1">
                      <InlineEdit value={edu.institution} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, institution: v } : e))} />
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-medium">
                      <InlineEdit value={edu.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, duration: v } : e))} />
                    </div>
                    {(isEditing || edu.cgpa) && (
                      <div className="text-xs font-bold text-slate-300 mt-1.5 inline-block bg-[#1c252e] px-2 py-0.5 rounded">
                        <InlineEdit value={resumeData.labels?.gpa ?? "GPA:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, gpa: v })} /> <InlineEdit value={edu.cgpa} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, cgpa: v } : e))} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        )}
      </div>

      {/* Right Content Area - Darker Slate */}
      <div className="w-[65%] p-10 bg-[#1c252e]">
        {hasVisibleExperience && (
          <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-3 mb-6 uppercase tracking-wider flex items-center gap-3">
                <span className="text-blue-500">◆</span>
                <InlineEdit value={resumeData.labels?.experience ?? "Experience"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, experience: v })} />
              </h2>
              <div className="space-y-8">
                {resumeData.experience.map((exp, i) => (isEditing || isExpNotEmpty(exp)) && (
                  <div key={exp.id || `exp-${i}`} className="relative">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-white text-lg flex items-center flex-wrap gap-2">
                        <span><InlineEdit value={exp.role} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, role: v } : e))} /></span>
                        {isEditing && activeSection === "experience" && onRegenerateItem && (
                          <button disabled={isRegeneratingItem === `experience-${i}`} onClick={(e) => { e.stopPropagation(); onRegenerateItem('experience', i); }} className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-blue-400 p-1 rounded-full transition-colors disabled:opacity-50 ml-1" title="Rewrite this experience with AI"><Wand2 size={12} className={isRegeneratingItem === `experience-${i}` ? "animate-pulse" : ""} /></button>
                        )}
                      </h3>
                      <span className="text-xs font-semibold text-blue-400 bg-blue-900/30 px-2.5 py-1 rounded border border-blue-800/50">
                        <InlineEdit value={exp.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, duration: v } : e))} />
                      </span>
                    </div>
                    <div className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                      <span className="text-slate-200"><InlineEdit value={exp.company} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, company: v } : e))} /></span>
                      <span className="text-slate-600"><InlineEdit value={resumeData.labels?.separator ?? "•"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, separator: v })} /></span>
                      <InlineEdit value={exp.location} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, location: v } : e))} />
                    </div>
                    <ul className="list-disc list-outside ml-5 text-sm space-y-2 text-slate-300 marker:text-slate-600">
                      {(exp.bullets || []).map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="pl-1">
                          <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('experience', exp.id, bulletIdx, v) : onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, bullets: Object.assign([...(e.bullets || [])], {[bulletIdx]: v}) } : e))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('experience', exp.id, bulletIdx, v) : undefined} />
                        </li>
                      ))}
                    </ul>
                    {isEditing && onAddBullet && (
                      <button onClick={(e) => { e.stopPropagation(); onAddBullet('experience', exp.id); }} className="text-[10px] text-blue-500 hover:text-blue-400 mt-2 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider ml-4">
                        + Add Bullet
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        )}

        {hasVisibleProjects && (
          <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white border-b border-slate-700 pb-3 mb-6 uppercase tracking-wider flex items-center gap-3">
                <span className="text-blue-500">◆</span>
                <InlineEdit value={resumeData.labels?.projects ?? "Projects"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, projects: v })} />
              </h2>
              <div className="space-y-8">
                {resumeData.projects.map((proj, i) => (isEditing || isProjNotEmpty(proj)) && (
                  <div key={proj.id || `proj-${i}`} className="bg-slate-800/30 p-5 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-white text-lg flex items-center flex-wrap gap-2">
                        <span><InlineEdit value={proj.name} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, name: v } : p))} /></span>
                        {isEditing && activeSection === "projects" && onRegenerateItem && (
                          <button disabled={isRegeneratingItem === `projects-${i}`} onClick={(e) => { e.stopPropagation(); onRegenerateItem('projects', i); }} className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-blue-400 p-1 rounded-full transition-colors disabled:opacity-50 ml-1" title="Rewrite this project with AI"><Wand2 size={12} className={isRegeneratingItem === `projects-${i}` ? "animate-pulse" : ""} /></button>
                        )}
                      </h3>
                      {(isEditing || proj.link) && (
                        <PrintLink className="text-blue-400 text-xs font-medium bg-blue-900/20 px-2 py-1 rounded" isEditing={isEditing} href={proj.link}>
                          <InlineEdit value={resumeData.labels?.link ?? "Link:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, link: v })} /> <InlineEdit value={proj.link} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, link: v } : p))} />
                        </PrintLink>
                      )}
                    </div>
                    <div className="text-xs text-blue-300 font-semibold mb-3 tracking-wide">
                      <InlineEdit value={proj.techStack?.join(" • ")} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, techStack: v.split(' • ') } : p))} />
                    </div>
                    <ul className="list-disc list-outside ml-5 text-sm space-y-2 text-slate-300 marker:text-slate-600">
                      {(proj.bullets || []).map((bullet, bulletIdx) => (
                        <li key={bulletIdx} className="pl-1">
                          <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('projects', proj.id, bulletIdx, v) : onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, bullets: Object.assign([...(p.bullets || [])], {[bulletIdx]: v}) } : p))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('projects', proj.id, bulletIdx, v) : undefined} />
                        </li>
                      ))}
                    </ul>
                    {isEditing && onAddBullet && (
                      <button onClick={(e) => { e.stopPropagation(); onAddBullet('projects', proj.id); }} className="text-[10px] text-blue-500 hover:text-blue-400 mt-2 flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity uppercase font-bold tracking-wider ml-4">
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
