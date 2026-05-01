import React from "react";
import EditableSection from "../resume/EditableSection";
import InlineEdit from "../resume/InlineEdit";
import { Wand2 } from "lucide-react";

export default function Creative({ resumeData, isEditing, onSectionClick, activeSection, onUpdateSection, onRegenerate, isRegenerating, onRegenerateItem, isRegeneratingItem }) {
  if (!resumeData) return null;

  return (
    <div className="bg-gray-50 flex max-w-[850px] min-h-[1100px] mx-auto text-gray-800 font-sans overflow-hidden shadow-2xl">
      {/* Left Sidebar - Dark with Neon Accents */}
      <div className="w-[35%] bg-gray-900 text-gray-100 p-8 flex flex-col gap-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
        
        <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 mb-4">
              <InlineEdit value={resumeData.personalInfo.fullName} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, fullName: v })} placeholder="Your Name" />
            </h1>
            <div className="flex flex-col gap-3 text-sm text-gray-300 font-medium">
              <span className="flex items-center gap-3"><span className="text-pink-400">✉</span> <InlineEdit value={resumeData.personalInfo.email} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, email: v })} placeholder="Email" /></span>
              <span className="flex items-center gap-3"><span className="text-pink-400">☎</span> <InlineEdit value={resumeData.personalInfo.phone} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, phone: v })} placeholder="Phone" /></span>
              <span className="flex items-center gap-3"><span className="text-pink-400">⚲</span> <InlineEdit value={resumeData.personalInfo.location} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, location: v })} placeholder="Location" /></span>
            </div>
            <div className="mt-6 flex gap-4 text-sm font-medium">
              <span className="text-purple-400 hover:text-purple-300"><InlineEdit value={resumeData.labels?.linkedin ?? "LinkedIn:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, linkedin: v })} /> <InlineEdit value={resumeData.personalInfo.linkedin} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, linkedin: v })} placeholder="URL" /></span>
              <span className="text-purple-400 hover:text-purple-300"><InlineEdit value={resumeData.labels?.github ?? "GitHub:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, github: v })} /> <InlineEdit value={resumeData.personalInfo.github} isEditing={isEditing} onChange={(v) => onUpdateSection('personalInfo', { ...resumeData.personalInfo, github: v })} placeholder="URL" /></span>
            </div>
          </div>
        </EditableSection>

        {resumeData.summary && (
          <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
              <h2 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Summary
              </h2>
              <p className="text-xs leading-relaxed text-gray-300">
                <InlineEdit value={resumeData.summary} multiline={true} isEditing={isEditing} onChange={(v) => onUpdateSection('summary', v)} />
              </p>
            </div>
          </EditableSection>
        )}

        {resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.soft?.length > 0) && (
          <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <InlineEdit value={resumeData.labels?.skills ?? "Skills"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, skills: v })} />
              </h2>
              <div className="text-xs text-gray-300">
                {resumeData.skills.technical?.length > 0 && (
                  <div className="mb-4">
                    <span className="block font-bold text-gray-200 mb-2">
                      <InlineEdit value={resumeData.labels?.technical ?? "Technical"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, technical: v })} />
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.technical.map((s, i) => (
                        <span key={i} className="bg-gray-900 px-2.5 py-1 rounded-md border border-gray-700 text-pink-100">
                          <InlineEdit value={s} isEditing={isEditing} onChange={(v) => onUpdateSection('skills', { ...resumeData.skills, technical: Object.assign([...resumeData.skills.technical], {[i]: v}) })} />
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {resumeData.skills.soft?.length > 0 && (
                  <div>
                    <span className="block font-bold text-gray-200 mb-2">
                      <InlineEdit value={resumeData.labels?.soft ?? "Interpersonal"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, soft: v })} />
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.soft.map((s, i) => (
                        <span key={i} className="bg-gray-900 px-2.5 py-1 rounded-md border border-gray-700 text-purple-100">
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
      </div>

      {/* Right Content Area - Light bg */}
      <div className="w-[65%] p-10 bg-white">
        {resumeData.experience?.length > 0 && (
          <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-10">
              <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 shadow-sm shadow-pink-500/20">
                <InlineEdit value={resumeData.labels?.experience ?? "Experience"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, experience: v })} />
              </div>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-pink-500 before:to-purple-600 before:opacity-20 pl-8">
                {resumeData.experience.map((exp, i) => (
                  <div key={exp.id || `exp-${i}`} className="relative">
                    <div className="absolute w-3 h-3 bg-pink-500 rounded-full -left-[37px] top-1.5 shadow-[0_0_10px_rgba(236,72,153,0.5)] border border-white"></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 text-base flex items-center flex-wrap gap-2">
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
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        <InlineEdit value={exp.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, duration: v } : e))} />
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mb-3">
                      <InlineEdit value={exp.company} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, company: v } : e))} /> <span className="mx-1"><InlineEdit value={resumeData.labels?.separator ?? "•"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, separator: v })} /></span> <InlineEdit value={exp.location} isEditing={isEditing} onChange={(v) => onUpdateSection('experience', resumeData.experience.map(e => e.id === exp.id ? { ...e, location: v } : e))} />
                    </div>
                    <ul className="list-none text-sm space-y-2 text-gray-600">
                      {(exp.bullets || []).map((bullet, i) => (
                        <li key={i} className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-purple-300 before:rounded-sm">
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
            <div className="mb-10">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 shadow-sm shadow-purple-500/20">
                <InlineEdit value={resumeData.labels?.projects ?? "Projects"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, projects: v })} />
              </div>
              <div className="grid grid-cols-1 gap-6">
                {resumeData.projects.map((proj, i) => (
                  <div key={proj.id || `proj-${i}`} className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-gray-900 text-base flex items-center flex-wrap gap-2">
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
                      </h3>
                      <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs font-medium"><InlineEdit value={resumeData.labels?.link ?? "Link:"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, link: v })} /> <InlineEdit value={proj.link} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map(p => p.id === proj.id ? { ...p, link: v } : p))} /></span>
                    </div>
                    <div className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mb-3 inline-block">
                      <InlineEdit value={proj.techStack?.join(" + ")} isEditing={isEditing} onChange={(v) => onUpdateSection('projects', resumeData.projects.map(p => p.id === proj.id ? { ...p, techStack: v.split(' + ') } : p))} />
                    </div>
                    <ul className="list-disc list-outside ml-4 text-sm space-y-1.5 text-gray-600">
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

        {resumeData.education?.length > 0 && (
          <EditableSection sectionName="education" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "education"} onRegenerate={onRegenerate} isRegenerating={isRegenerating}>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                 <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest"><InlineEdit value={resumeData.labels?.education ?? "Education"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, education: v })} /></h2>
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                {resumeData.education.map((edu, i) => (
                  <div key={edu.id || `edu-${i}`} className="flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors flex items-center flex-wrap gap-2">
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
                      <div className="text-sm font-medium text-gray-500 mt-0.5">
                        <InlineEdit value={edu.institution} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, institution: v } : e))} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                        <InlineEdit value={edu.duration} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, duration: v } : e))} />
                      </div>
                      <div className="text-xs font-bold text-pink-500 mt-1"><InlineEdit value={resumeData.labels?.gpa ?? "GPA"} isEditing={isEditing} onChange={(v) => onUpdateSection('labels', { ...resumeData.labels, gpa: v })} /> <InlineEdit value={edu.cgpa} isEditing={isEditing} onChange={(v) => onUpdateSection('education', resumeData.education.map(e => e.id === edu.id ? { ...e, cgpa: v } : e))} /></div>
                    </div>
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
