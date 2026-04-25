import React from "react";
import EditableSection from "../resume/EditableSection";

export default function Creative({ resumeData, isEditing, onSectionClick, activeSection }) {
  if (!resumeData) return null;

  return (
    <div className="bg-gray-50 flex max-w-[850px] min-h-[1100px] mx-auto text-gray-800 font-sans overflow-hidden shadow-2xl">
      {/* Left Sidebar - Dark with Neon Accents */}
      <div className="w-[35%] bg-gray-900 text-gray-100 p-8 flex flex-col gap-6 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>
        
        <EditableSection sectionName="personalInfo" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "personalInfo"}>
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500 mb-4">{resumeData.personalInfo.fullName}</h1>
            <div className="flex flex-col gap-3 text-sm text-gray-300 font-medium">
              {resumeData.personalInfo.email && <span className="flex items-center gap-3"><span className="text-pink-400">✉</span> {resumeData.personalInfo.email}</span>}
              {resumeData.personalInfo.phone && <span className="flex items-center gap-3"><span className="text-pink-400">☎</span> {resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.location && <span className="flex items-center gap-3"><span className="text-pink-400">⚲</span> {resumeData.personalInfo.location}</span>}
            </div>
            <div className="mt-6 flex gap-4 text-sm font-medium">
              {resumeData.personalInfo.linkedin && <a href={resumeData.personalInfo.linkedin} className="text-purple-400 hover:text-purple-300">LinkedIn</a>}
              {resumeData.personalInfo.github && <a href={resumeData.personalInfo.github} className="text-purple-400 hover:text-purple-300">GitHub</a>}
            </div>
          </div>
        </EditableSection>

        {resumeData.summary && (
          <EditableSection sectionName="summary" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "summary"}>
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
              <h2 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                Summary
              </h2>
              <p className="text-xs leading-relaxed text-gray-300">{resumeData.summary}</p>
            </div>
          </EditableSection>
        )}

        {resumeData.skills && (resumeData.skills.technical?.length > 0 || resumeData.skills.soft?.length > 0) && (
          <EditableSection sectionName="skills" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "skills"}>
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700/50">
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Skills
              </h2>
              <div className="text-xs text-gray-300">
                {resumeData.skills.technical?.length > 0 && (
                  <div className="mb-4">
                    <span className="block font-bold text-gray-200 mb-2">Technical</span>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.technical.map(s => <span key={s} className="bg-gray-900 px-2.5 py-1 rounded-md border border-gray-700 text-pink-100">{s}</span>)}
                    </div>
                  </div>
                )}
                {resumeData.skills.soft?.length > 0 && (
                  <div>
                    <span className="block font-bold text-gray-200 mb-2">Interpersonal</span>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.soft.map(s => <span key={s} className="bg-gray-900 px-2.5 py-1 rounded-md border border-gray-700 text-purple-100">{s}</span>)}
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
          <EditableSection sectionName="experience" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "experience"}>
            <div className="mb-10">
              <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 shadow-sm shadow-pink-500/20">
                Experience
              </div>
              <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-pink-500 before:to-purple-600 before:opacity-20 pl-8">
                {resumeData.experience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    <div className="absolute w-3 h-3 bg-pink-500 rounded-full -left-[37px] top-1.5 shadow-[0_0_10px_rgba(236,72,153,0.5)] border border-white"></div>
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-gray-900 text-base">{exp.role}</h3>
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">{exp.duration}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mb-3">
                      {exp.company} <span className="mx-1">•</span> {exp.location}
                    </div>
                    <ul className="list-none text-sm space-y-2 text-gray-600">
                      {exp.bullets.map((bullet, i) => (
                        <li key={i} className="relative pl-4 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-purple-300 before:rounded-sm">
                          {bullet}
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
          <EditableSection sectionName="projects" isEditing={isEditing} onClick={onSectionClick} isActive={activeSection === "projects"}>
            <div className="mb-10">
              <div className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-6 shadow-sm shadow-purple-500/20">
                Projects
              </div>
              <div className="grid grid-cols-1 gap-6">
                {resumeData.projects.map(proj => (
                  <div key={proj.id} className="bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-gray-900 text-base">
                        {proj.name} 
                      </h3>
                      {proj.link && <a href={proj.link} className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded text-xs font-medium hover:bg-purple-100 transition-colors">View Project</a>}
                    </div>
                    <div className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 mb-3 inline-block">
                      {proj.techStack?.join(" + ")}
                    </div>
                    <ul className="list-disc list-outside ml-4 text-sm space-y-1.5 text-gray-600">
                      {proj.bullets.map((bullet, i) => <li key={i}>{bullet}</li>)}
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
              <div className="flex items-center gap-3 mb-6">
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
                 <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Education</h2>
                 <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-purple-200 to-transparent"></div>
              </div>
              
              <div className="space-y-4">
                {resumeData.education.map(edu => (
                  <div key={edu.id} className="flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-purple-600 transition-colors">{edu.degree} in {edu.field}</h3>
                      <div className="text-sm font-medium text-gray-500 mt-0.5">{edu.institution}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{edu.duration}</div>
                      {edu.cgpa && <div className="text-xs font-bold text-pink-500 mt-1">GPA {edu.cgpa}</div>}
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
