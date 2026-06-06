import { useState, useCallback, useRef } from "react";
import EditableSection from "../resume/EditableSection";
import InlineEdit from "../resume/InlineEdit";
import PrintLink from "../resume/PrintLink";
import { Wand2 } from "lucide-react";
import ItemReorderButtons from "../resume/ItemReorderButtons";
import { RESUME_PAGE_MIN_HEIGHT_STYLE } from "../../services/resumeLayout";

export default function Creative({ resumeData, isEditing, onSectionClick, activeSection, onUpdateSection, onRegenerate, isRegenerating, onRegenerateItem, isRegeneratingItem, onRewriteBulletRequest, onUpdateBullet, onAddBullet, onReorderItem }) {
  const [liveExpLeft, setLiveExpLeft] = useState(null);
  const [liveBottomLeft, setLiveBottomLeft] = useState(null);
  const bottomRef = useRef(null);

  const cleanUrl = (url) => url.replace(/^https?:\/\/(www\.)?/, '');
  const expLeftPct = liveExpLeft ?? (resumeData?.creativeExpLeftPct ?? 33);
  const bottomLeftPct = liveBottomLeft ?? (resumeData?.creativeBottomLeftPct ?? 50);

  const handleExpDragStart = useCallback((e) => {
    e.preventDefault();
    const row = e.currentTarget.parentElement;
    let finalWidth = null;
    const onMouseMove = (moveEvent) => {
      const rect = row.getBoundingClientRect();
      if (!rect.width) return;
      const raw = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      finalWidth = Math.max(15, Math.min(55, Math.round(raw)));
      setLiveExpLeft(finalWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (finalWidth !== null) onUpdateSection?.('creativeExpLeftPct', finalWidth);
      setLiveExpLeft(null);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [onUpdateSection]);

  const handleBottomDragStart = useCallback((e) => {
    e.preventDefault();
    let finalWidth = null;
    const onMouseMove = (moveEvent) => {
      const rect = bottomRef.current?.getBoundingClientRect();
      if (!rect?.width) return;
      const raw = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      finalWidth = Math.max(25, Math.min(75, Math.round(raw)));
      setLiveBottomLeft(finalWidth);
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (finalWidth !== null) onUpdateSection?.('creativeBottomLeftPct', finalWidth);
      setLiveBottomLeft(null);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [onUpdateSection]);

  if (!resumeData) return null;

  const isExpNotEmpty = (exp) => exp.role?.toString()?.trim() || exp.company?.toString()?.trim() || exp.duration?.toString()?.trim() || exp.location?.toString()?.trim() || exp.bullets?.some(b => b?.toString()?.trim());
  const hasVisibleExperience = isEditing || resumeData.experience?.some(isExpNotEmpty);

  const isProjNotEmpty = (proj) => proj.name?.toString()?.trim() || proj.link?.toString()?.trim() || proj.techStack?.length > 0 || proj.bullets?.some(b => b?.toString()?.trim());
  const hasVisibleProjects = isEditing || resumeData.projects?.some(isProjNotEmpty);

  const isEduNotEmpty = (edu) => edu.degree?.toString()?.trim() || edu.field?.toString()?.trim() || edu.institution?.toString()?.trim() || edu.duration?.toString()?.trim() || edu.cgpa?.toString()?.trim();
  const hasVisibleEducation = isEditing || resumeData.education?.some(isEduNotEmpty);

  const hasVisibleSkills = isEditing || resumeData.skills?.technical?.some(s => s?.toString()?.trim()) || resumeData.skills?.soft?.some(s => s?.toString()?.trim());

  const hasVisibleSummary = isEditing || resumeData.summary?.toString()?.trim();

  // Color Palette Tokens
  const bg = "bg-[#EAEBE5]";
  const accentText = "text-[#D32F2F]";
  const accentBg = "bg-[#D32F2F]";
  const darkText = "text-[#121212]";
  const textMuted = "text-[#555555]";

  return (
    <div
      className={`resume-template-root creative-template-root ${bg} flex flex-col max-w-[850px] mx-auto font-sans shadow-2xl p-12 relative`}
      style={{ ...RESUME_PAGE_MIN_HEIGHT_STYLE, fontFamily: 'inherit' }}
    >
      {/* Editorial Name Header */}
      <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
        <div className="mb-10">
          <div className="w-full flex flex-col md:flex-row print:flex-row justify-between items-end mb-8 gap-4 pb-2">
            <h1 className={`text-[4rem] md:text-[5.5rem] print:text-[5.5rem] font-black ${accentText} uppercase tracking-tighter leading-[0.8] break-words`}>
              <InlineEdit value={resumeData.personalInfo.fullName} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, fullName: v })} placeholder="Your Name" />
            </h1>
            <div className={`text-sm md:text-base print:text-base font-black ${darkText} uppercase tracking-[0.2em] md:text-right print:text-right pb-1 max-w-[300px]`}>
              <InlineEdit value={resumeData.personalInfo.title} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, title: v })} placeholder="PROFESSIONAL TITLE" />
            </div>
          </div>

          {/* Clean Contact Grid */}
          <div className={`creative-contact-grid grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-y-6 gap-x-4`}>
            {(isEditing || resumeData.personalInfo.phone) && (
              <div className="flex flex-col px-2 md:px-0">
                <div className={`${darkText} text-[10px] font-black tracking-[0.2em] uppercase mb-1`}><InlineEdit value={resumeData.labels?.phone ?? "PHONE"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, phone: v })} /></div>
                <PrintLink className={`${textMuted} text-xs font-bold`} isEditing={isEditing} href={resumeData.personalInfo.phone ? `tel:${resumeData.personalInfo.phone}` : ""}><InlineEdit value={resumeData.personalInfo.phone} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, phone: v })} placeholder="Phone" /></PrintLink>
              </div>
            )}
            {(isEditing || resumeData.personalInfo.email) && (
              <div className="flex flex-col px-2 md:px-0">
                <div className={`${darkText} text-[10px] font-black tracking-[0.2em] uppercase mb-1`}><InlineEdit value={resumeData.labels?.email ?? "EMAIL"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, email: v })} /></div>
                <PrintLink className={`lowercase ${textMuted} text-xs font-bold truncate`} isEditing={isEditing} href={resumeData.personalInfo.email ? `mailto:${resumeData.personalInfo.email}` : ""}><InlineEdit value={resumeData.personalInfo.email} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, email: v })} placeholder="Email" /></PrintLink>
              </div>
            )}
            {(isEditing || resumeData.personalInfo.linkedin) && (
              <div className="flex flex-col px-2 md:px-0">
                <div className={`${darkText} text-[10px] font-black tracking-[0.2em] uppercase mb-1`}><InlineEdit value={resumeData.labels?.linkedin ?? "LINKEDIN"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, linkedin: v })} /></div>
                <PrintLink className={`${textMuted} text-xs font-bold lowercase hover:${accentText} transition-colors truncate`} isEditing={isEditing} href={resumeData.personalInfo.linkedin}>
                  <InlineEdit value={resumeData.personalInfo.linkedin} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, linkedin: v })} placeholder="URL" displayTransform={cleanUrl} />
                </PrintLink>
              </div>
            )}
            {(isEditing || resumeData.personalInfo.github) && (
              <div className="flex flex-col px-2 md:px-0">
                <div className={`${darkText} text-[10px] font-black tracking-[0.2em] uppercase mb-1`}><InlineEdit value={resumeData.labels?.github ?? "WEBSITE"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, github: v })} /></div>
                <PrintLink className={`${textMuted} text-xs font-bold lowercase hover:${accentText} transition-colors truncate`} isEditing={isEditing} href={resumeData.personalInfo.github}>
                  <InlineEdit value={resumeData.personalInfo.github} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, github: v })} placeholder="URL" displayTransform={cleanUrl} />
                </PrintLink>
              </div>
            )}
          </div>
        </div>
      </EditableSection>

      {/* Main Content Area */}
      <div className="flex flex-col gap-10">

        {hasVisibleSummary && (
          <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div>
              <h2 className={`text-2xl font-black ${accentText} uppercase tracking-[0.15em] mb-4 flex items-center gap-4`}>
                <InlineEdit className="!w-auto" value={resumeData.labels?.summary ?? "PROFILE"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, summary: v })} />
                <div className={`h-1 flex-1 ${accentBg}`}></div>
              </h2>
              <div className="pl-0 md:pl-8">
                <p className={`text-[13px] md:text-[14px] font-semibold ${darkText} uppercase leading-[1.8] tracking-wide`}>
                  <InlineEdit value={resumeData.summary} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateSection('summary', v)} />
                </p>
              </div>
            </div>
          </EditableSection>
        )}

        {hasVisibleExperience && (
          <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div>
              <h2 className={`text-2xl font-black ${accentText} uppercase tracking-[0.15em] mb-8 flex items-center gap-4`}>
                <InlineEdit className="!w-auto" value={resumeData.labels?.experience ?? "EXPERIENCE"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, experience: v })} />
                <div className={`h-1 flex-1 ${accentBg}`}></div>
              </h2>

              <div className="creative-timeline space-y-10 pl-6 md:pl-8 print:pl-8 border-l-2 border-[#121212]/20 relative">
                {resumeData.experience.map((exp, i) => (isEditing || isExpNotEmpty(exp)) && (
                  <div key={exp.id || `exp-${i}`} className="creative-role-grid flex group relative">
                    <div className={`creative-timeline-dot absolute -left-[31px] md:-left-[39px] print:-left-[39px] top-1.5 w-3 h-3 ${accentBg} rounded-full border-2 border-[#EAEBE5]`}></div>
                    {/* Left Column: Role & Meta */}
                    <div className="flex-shrink-0 border-r-2 border-[#121212]/10 pr-6" style={{ width: `${expLeftPct}%` }}>
                      <h3 className={`font-black text-lg ${darkText} uppercase leading-tight mb-2`}>
                        <InlineEdit value={exp.role} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, role: v } : e))} />
                        {isEditing && activeSection === "experience" && onRegenerateItem && (
                          <button
                            disabled={isRegeneratingItem === `experience-${i}`}
                            onClick={(e) => { e.stopPropagation(); onRegenerateItem('experience', i); }}
                            className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors disabled:opacity-50 ml-2 align-middle"
                            title="Rewrite this experience with AI"
                          >
                            <Wand2 size={12} className={isRegeneratingItem === `experience-${i}` ? "animate-pulse" : ""} />
                          </button>
                        )}
                        {isEditing && onReorderItem && (
                          <ItemReorderButtons index={i} total={resumeData.experience.length} onMove={(from, to) => onReorderItem('experience', from, to)} />
                        )}
                      </h3>
                      <div className={`text-sm font-bold ${accentText} uppercase mb-1`}>
                        <InlineEdit value={exp.company} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, company: v } : e))} />
                      </div>
                      <div className={`text-[11px] font-black ${textMuted} uppercase tracking-widest`}>
                        <InlineEdit value={exp.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, duration: v } : e))} />
                      </div>
                    </div>
                    {/* Drag Handle - only in edit mode */}
                    {isEditing && (
                      <div
                        onMouseDown={handleExpDragStart}
                        title="Drag to resize columns"
                        className="relative flex-shrink-0 group/handle"
                        style={{ width: '8px', cursor: 'col-resize', userSelect: 'none' }}
                      >
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#121212]/10 group-hover/handle:bg-[#D32F2F] transition-colors" />
                        <div
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/handle:opacity-100 transition-opacity"
                          style={{ width: '4px', height: '24px', borderRadius: '2px', background: '#D32F2F' }}
                        />
                      </div>
                    )}
                    {/* Right Column: Bullets */}
                    <div className="pl-6" style={{ flex: 1, minWidth: 0 }}>
                      <ul className={`list-none space-y-3 text-[13px] font-semibold ${darkText} leading-[1.7] tracking-wide`}>
                        {(exp.bullets || []).map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="creative-bullet-diamond relative pl-5 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-[#121212] before:rotate-45">
                            <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('experience', exp.id, bulletIdx, v) : onUpdateSection('experience', resumeData.experience.map((e, idx) => idx === i ? { ...e, bullets: Object.assign([...(e.bullets || [])], { [bulletIdx]: v }) } : e))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('experience', exp.id, bulletIdx, v) : undefined} />
                          </li>
                        ))}
                      </ul>
                      {isEditing && onAddBullet && (
                        <button onClick={(e) => { e.stopPropagation(); onAddBullet('experience', exp.id); }} className={`text-[10px] ${accentText} hover:opacity-70 mt-3 flex items-center gap-1 opacity-50 transition-opacity uppercase font-black tracking-widest`}>
                          + ADD BULLET
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        )}

        {/* 2-Column Grid for Projects & Skills/Education */}
        <div ref={bottomRef} className="creative-two-col-grid flex">

          {hasVisibleProjects && (
            <div className="flex-shrink-0" style={{ width: `${bottomLeftPct}%` }}>
              <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
                <div>
                  <h2 className={`text-2xl font-black ${accentText} uppercase tracking-[0.15em] mb-6 flex items-center gap-4`}>
                    <InlineEdit className="!w-auto" value={resumeData.labels?.projects ?? "PROJECTS"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, projects: v })} />
                    <div className={`h-1 flex-1 ${accentBg}`}></div>
                  </h2>
                  <div className="creative-timeline space-y-8 pl-6 border-l-2 border-[#121212]/20 relative">
                    {resumeData.projects.map((proj, i) => (isEditing || isProjNotEmpty(proj)) && (
                      <div key={proj.id || `proj-${i}`} className="relative">
                        <div className={`creative-timeline-dot absolute -left-[31px] top-1.5 w-3 h-3 ${accentBg} rounded-full border-2 border-[#EAEBE5]`}></div>
                        <h3 className={`font-black text-base ${darkText} uppercase tracking-wider flex items-center flex-wrap gap-2 mb-1`}>
                          <span><InlineEdit value={proj.name} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, name: v } : p))} /></span>
                          {isEditing && activeSection === "projects" && onRegenerateItem && (
                            <button
                              disabled={isRegeneratingItem === `projects-${i}`}
                              onClick={(e) => { e.stopPropagation(); onRegenerateItem('projects', i); }}
                              className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors disabled:opacity-50 ml-1"
                              title="Rewrite this project with AI"
                            >
                              <Wand2 size={12} className={isRegeneratingItem === `projects-${i}` ? "animate-pulse" : ""} />
                            </button>
                          )}
                          {isEditing && onReorderItem && (
                            <ItemReorderButtons index={i} total={resumeData.projects.length} onMove={(from, to) => onReorderItem('projects', from, to)} />
                          )}
                        </h3>
                        {(isEditing || proj.techStack?.length > 0) && (
                          <div className={`text-[11px] font-black ${accentText} uppercase tracking-widest mb-3`}>
                            <InlineEdit value={(Array.isArray(proj.techStack) ? proj.techStack : []).join(" // ")} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, techStack: v.split('//').map(s => s.trim()) } : p))} placeholder="Tech Stack" />
                          </div>
                        )}
                        <ul className={`list-none space-y-2 text-[13px] font-semibold ${textMuted} uppercase leading-[1.6] tracking-wide`}>
                          {(proj.bullets || []).map((bullet, bulletIdx) => (
                            <li key={bulletIdx} className="creative-bullet-square relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:border-2 before:border-[#121212]">
                              <InlineEdit value={bullet} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateBullet ? onUpdateBullet('projects', proj.id, bulletIdx, v) : onUpdateSection('projects', resumeData.projects.map((p, idx) => idx === i ? { ...p, bullets: Object.assign([...(p.bullets || [])], { [bulletIdx]: v }) } : p))} onAiRewrite={onRewriteBulletRequest ? (v) => onRewriteBulletRequest('projects', proj.id, bulletIdx, v) : undefined} />
                            </li>
                          ))}
                        </ul>
                        {isEditing && onAddBullet && (
                          <button onClick={(e) => { e.stopPropagation(); onAddBullet('projects', proj.id); }} className={`text-[10px] ${accentText} hover:opacity-70 mt-2 flex items-center gap-1 opacity-50 transition-opacity uppercase font-black tracking-widest`}>
                            + ADD BULLET
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </EditableSection>
            </div>
          )}

          {/* Bottom section drag handle - only in edit mode */}
          {isEditing && hasVisibleProjects && (
            <div
              onMouseDown={handleBottomDragStart}
              title="Drag to resize columns"
              className="relative flex-shrink-0 group/bhandle"
              style={{ width: '8px', cursor: 'col-resize', userSelect: 'none' }}
            >
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#121212]/10 group-hover/bhandle:bg-[#D32F2F] transition-colors" />
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/bhandle:opacity-100 transition-opacity"
                style={{ width: '4px', height: '24px', borderRadius: '2px', background: '#D32F2F' }}
              />
            </div>
          )}

          <div className="flex flex-col gap-12" style={{ flex: 1, minWidth: 0, paddingLeft: hasVisibleProjects ? '40px' : 0 }}>
            {hasVisibleSkills && (
              <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
                <div>
                  <h2 className={`text-2xl font-black ${accentText} uppercase tracking-[0.15em] mb-6 flex items-center gap-4`}>
                    <InlineEdit className="!w-auto" value={resumeData.labels?.skills ?? "SKILLS"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, skills: v })} />
                    <div className={`h-1 flex-1 ${accentBg}`}></div>
                  </h2>
                  <div className="pl-0 md:pl-2">
                    {(isEditing || resumeData.skills.technical?.some(s => s?.toString()?.trim())) && (
                      <div className="mb-6">
                        <div className={`text-[10px] font-black ${textMuted} uppercase tracking-[0.2em] mb-2`}><InlineEdit value={resumeData.labels?.technical ?? "TECHNICAL"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, technical: v })} /></div>
                        <div className="flex flex-wrap gap-2">
                          {(resumeData.skills.technical || []).map((s, i) => (isEditing || s?.toString()?.trim()) && (
                            <span key={`tech-${i}`} className={`px-3.5 py-1.5 bg-transparent border-2 border-[#121212] rounded-full ${darkText} text-[11px] font-bold uppercase tracking-widest`}>
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
                              className={`px-3.5 py-1.5 bg-[#D4D5CF] rounded-full ${darkText} text-[11px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity`}
                            >
                              + ADD
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {(isEditing || resumeData.skills.soft?.some(s => s?.toString()?.trim())) && (
                      <div>
                        <div className={`text-[10px] font-black ${textMuted} uppercase tracking-[0.2em] mb-2`}><InlineEdit value={resumeData.labels?.soft ?? "PROFESSIONAL"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, soft: v })} /></div>
                        <div className="flex flex-wrap gap-2">
                          {(resumeData.skills.soft || []).map((s, i) => (isEditing || s?.toString()?.trim()) && (
                            <span key={`soft-${i}`} className={`px-3.5 py-1.5 ${accentBg} rounded-full text-[#EAEBE5] text-[11px] font-bold uppercase tracking-widest`}>
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
                              className={`px-3.5 py-1.5 ${accentBg} rounded-full text-white text-[11px] font-bold uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity`}
                            >
                              + ADD
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
                  <h2 className={`text-2xl font-black ${accentText} uppercase tracking-[0.15em] mb-6 flex items-center gap-4`}>
                    <InlineEdit className="!w-auto" value={resumeData.labels?.education ?? "EDUCATION"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, education: v })} />
                    <div className={`h-1 flex-1 ${accentBg}`}></div>
                  </h2>
                  <div className="creative-timeline space-y-8 pl-6 border-l-2 border-[#121212]/20 relative">
                    {resumeData.education.map((edu, i) => (isEditing || isEduNotEmpty(edu)) && (
                      <div key={edu.id || `edu-${i}`} className="relative">
                        <div className={`creative-timeline-dot absolute -left-[31px] top-1.5 w-3 h-3 ${accentBg} rounded-full border-2 border-[#EAEBE5]`}></div>
                        <h3 className={`font-black text-[15px] ${darkText} uppercase tracking-wider flex items-center flex-wrap gap-2 mb-1`}>
                          <span><InlineEdit value={edu.degree} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, degree: v } : e))} /> <InlineEdit value={resumeData.labels?.in ?? "IN"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, in: v })} /> <InlineEdit value={edu.field} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, field: v } : e))} /></span>
                          {isEditing && activeSection === "education" && onRegenerateItem && (
                            <button
                              disabled={isRegeneratingItem === `education-${i}`}
                              onClick={(e) => { e.stopPropagation(); onRegenerateItem('education', i); }}
                              className="inline-flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 p-1 rounded-full transition-colors disabled:opacity-50 ml-1"
                              title="Rewrite this education with AI"
                            >
                              <Wand2 size={12} className={isRegeneratingItem === `education-${i}` ? "animate-pulse" : ""} />
                            </button>
                          )}
                          {isEditing && onReorderItem && (
                            <ItemReorderButtons index={i} total={resumeData.education.length} onMove={(from, to) => onReorderItem('education', from, to)} />
                          )}
                        </h3>
                        <div className={`text-xs font-bold ${textMuted} uppercase tracking-wider flex flex-col gap-0.5`}>
                          <span className={`${accentText}`}><InlineEdit value={edu.institution} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, institution: v } : e))} /></span>
                          <span><InlineEdit value={edu.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map((e, idx) => idx === i ? { ...e, duration: v } : e))} /></span>
                        </div>
                        {(isEditing || edu.cgpa) && (
                          <div className={`text-[11px] mt-2 font-black ${darkText} uppercase tracking-widest`}>
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
        </div>

      </div>
    </div>
  );
}
