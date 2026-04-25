import { BookOpen, CheckCircle, AlertCircle, Zap } from "lucide-react";

const glassCard = {
  background: "rgba(25,31,49,0.5)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const sectionDivider = { borderBottom: "1px solid rgba(255,255,255,0.06)" };

export default function Resources() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 fade-in">
      <div className="page-header">
        <h1 className="page-title">Resume Resources</h1>
        <p className="page-subtitle">Knowledge base to help you build a top-tier resume</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Action Verbs */}
        <div className="p-6 rounded-xl" style={glassCard}>
          <div className="flex items-center gap-2 mb-5 pb-3" style={sectionDivider}>
            <Zap size={18} className="text-primary" />
            <h3 className="font-semibold text-on-surface">Strong Action Verbs</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: "Leadership & Management", words: "Spearheaded, Orchestrated, Directed, Cultivated, Piloted, Executed, Navigated." },
              { title: "Technical & Engineering", words: "Architected, Engineered, Formulated, Deployed, Optimized, Overhauled, Programmed." },
              { title: "Problem Solving", words: "Resolved, Streamlined, Troubleshot, Revamped, Reconciled, Clarified." },
            ].map(({ title, words }) => (
              <div key={title}>
                <h4 className="font-semibold text-on-surface text-sm mb-1">{title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{words}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ATS Best Practices */}
        <div className="p-6 rounded-xl" style={glassCard}>
          <div className="flex items-center gap-2 mb-5 pb-3" style={sectionDivider}>
            <CheckCircle size={18} className="text-green-400" />
            <h3 className="font-semibold text-on-surface">ATS Best Practices</h3>
          </div>
          <ul className="space-y-3">
            {[
              "Use standard section headers (Experience, Education).",
              "Include exact keywords from the job description.",
              "Save and submit your resume as a PDF unless specified otherwise.",
              "Avoid complex tables, columns, or graphics that confuse parsers.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-on-surface-variant items-start">
                <span className="text-green-400 mt-0.5">&middot;</span>
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Common Mistakes */}
        <div className="p-6 rounded-xl md:col-span-2" style={glassCard}>
          <div className="flex items-center gap-2 mb-5 pb-3" style={sectionDivider}>
            <AlertCircle size={18} className="text-orange-400" />
            <h3 className="font-semibold text-on-surface">Common Mistakes to Avoid</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Using paragraphs instead of bullet points. Recruiters skim resumes in 6 seconds.",
              "Including a photo or full address. City, State and email/phone is enough.",
              'Listing responsibilities instead of achievements ("Accomplished X by Y").',
              'Including subjective soft skills like "Hard worker". Prove this through examples.',
            ].map((mistake, i) => (
              <p key={i} className="flex gap-2 text-sm text-on-surface-variant items-start">
                <span className="text-orange-400 mt-0.5 shrink-0">&times;</span>
                <span>{mistake}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
