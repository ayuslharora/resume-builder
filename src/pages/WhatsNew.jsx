import {
  FileText,
  Link2,
  PencilLine,
  RefreshCw,
  Sparkles,
  Undo2,
  CheckSquare,
  Wrench,
  Zap,
  Type,
  Download,
  Bug,
} from "lucide-react";

const CHANGELOG = [
  {
    date: "May 2025",
    entries: [
      {
        type: "feature",
        title: "Per-selection font family & size",
        desc: "Select any text in your resume and change its font family or size directly from the toolbar. Pick from eight professional typefaces — each option rendered in its own font so you can see exactly what you're choosing. Changes persist through export.",
        icon: Type,
      },
      {
        type: "feature",
        title: "ATS-optimised browser PDF export",
        desc: "Save as PDF now uses the browser's native print engine, producing a real text layer that ATS scanners can parse reliably. No server round-trip, no pixel-image output — just clean, selectable text that passes keyword extraction.",
        icon: Download,
      },
      {
        type: "feature",
        title: "DOCX export for all templates",
        desc: "Download a fully formatted Word document for any template — Minimal, Modern, Professional, or Creative. Layout, colours, and sidebar columns are all faithfully reproduced using native DOCX constructs (no HTML embedded in the file).",
        icon: FileText,
      },
      {
        type: "improvement",
        title: "Rich text toolbar — font controls",
        desc: "The formatting toolbar now shows the font family and size of whatever text your cursor is in, updating live as you move around. Type a size directly into the field or use +/− for quick adjustments up to 84 pt.",
        icon: Wrench,
      },
      {
        type: "fix",
        title: "Inline formatting survives re-renders",
        desc: "Bold, italic, font changes, and size adjustments now persist correctly across AI rewrites and state updates. Previously, React's reconciler could silently reset inline formatting applied via the toolbar.",
        icon: Bug,
      },
      {
        type: "feature",
        title: "Grade resumes by shared link",
        desc: "Paste a public ResuMe share link directly into the Grader — no PDF upload required. Useful for reviewing a collaborator's or candidate's resume without touching a file.",
        icon: Link2,
      },
      {
        type: "fix",
        title: "Sidebar syncs live on delete",
        desc: "Deleting a resume from the dashboard now instantly removes it from the sidebar's Recent list — no stale entries, no refresh needed.",
        icon: RefreshCw,
      },
    ],
  },
  {
    date: "Apr 2025",
    entries: [
      {
        type: "feature",
        title: "Undo / Redo in the builder",
        desc: "Full undo and redo across all builder edits. Step back through every change with ⌘Z and forward with ⌘⇧Z. Nothing is permanent unless you want it to be.",
        icon: Undo2,
      },
      {
        type: "feature",
        title: "Cover Letter generator",
        desc: "Generate a tailored cover letter from your resume in one click. Pulls context from your experience and the target role. Accessible from the builder export panel.",
        icon: FileText,
      },
      {
        type: "improvement",
        title: "Inline resume title editing",
        desc: "Click any resume title in the builder to rename it on the spot. No modal, no extra clicks — just type and move on.",
        icon: PencilLine,
      },
      {
        type: "improvement",
        title: "Pixel-accurate PDF export",
        desc: "Rebuilt PDF rendering with server-side Puppeteer — every font and color preserved, with a real text layer so ATS scanners can read your resume.",
        icon: Zap,
      },
    ],
  },
  {
    date: "Mar 2025",
    entries: [
      {
        type: "feature",
        title: "Resume Grader with four review lenses",
        desc: "Grade your resume from four distinct perspectives: ATS scanner, HR recruiter, Hiring manager, or Campus placement. Each lens weights criteria differently and surfaces unique feedback.",
        icon: CheckSquare,
      },
      {
        type: "feature",
        title: "Publish and share your resume",
        desc: "Generate a permanent public link for any resume. Share it with recruiters directly, embed it in a portfolio, or use it as the input for the Grader's shared-link mode.",
        icon: Link2,
      },
      {
        type: "feature",
        title: "Four ATS-ready templates",
        desc: "Chose from four professionally designed templates — each built to parse cleanly and look sharp in a recruiter's inbox. Switch templates any time without losing your content.",
        icon: FileText,
      },
    ],
  },
  {
    date: "Feb 2025",
    entries: [
      {
        type: "feature",
        title: "AI-powered resume builder",
        desc: "Write once, improve forever. The builder uses Groq-powered AI to generate bullets, suggest rewrites, and tailor content to a target role — all inside the editor.",
        icon: Sparkles,
      },
      {
        type: "feature",
        title: "Rich text toolbar",
        desc: "Bold, italic, underline, and bullet formatting built directly into every text field. Formatting that survives PDF export.",
        icon: Wrench,
      },
    ],
  },
];

const TYPE_CONFIG = {
  feature: { label: "Feature", cls: "pill pill-accent" },
  improvement: { label: "Improvement", cls: "pill" },
  fix: { label: "Fix", cls: "pill" },
};

export default function WhatsNew() {
  return (
    <div className="app-page app-page-narrow fade-in">
      <div className="mb-10">
        <div className="lbl-mono mb-2">Changelog</div>
        <h1 className="h-display m-0 text-[30px]">
          What&rsquo;s new in{" "}
          <span className="serif italic font-normal text-[var(--accent)]">ResuMe.</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
          Every update, improvement, and fix — most recent first.
        </p>
      </div>

      <div className="space-y-10">
        {CHANGELOG.map((group) => (
          <section key={group.date}>
            <div className="mb-4 flex items-center gap-3">
              <span className="lbl-mono">{group.date}</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>
            <div className="space-y-3">
              {group.entries.map((entry) => (
                <ChangeEntry key={entry.title} entry={entry} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="panel mt-10 flex items-center gap-4 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Sparkles size={16} className="text-[var(--accent)]" />
        </div>
        <div>
          <div className="text-[13px] font-medium text-[var(--text)]">More coming soon</div>
          <div className="text-[12px] text-[var(--muted)]">
            Job tracker, interview prep tools, and smarter AI suggestions are in progress.
          </div>
        </div>
      </div>
    </div>
  );
}

function ChangeEntry({ entry }) {
  const Icon = entry.icon;
  const { label, cls } = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.feature;

  return (
    <article className="panel p-5">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Icon size={15} className="text-[var(--muted)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[14px] font-semibold text-[var(--text)]">{entry.title}</span>
            <span className={cls}>{label}</span>
          </div>
          <p className="m-0 text-[13px] leading-relaxed text-[var(--muted)]">{entry.desc}</p>
        </div>
      </div>
    </article>
  );
}
