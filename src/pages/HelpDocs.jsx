import {
  ArrowRight,
  BookOpen,
  CheckSquare,
  Download,
  HelpCircle,
  Keyboard,
  Link2,
  PencilLine,
  Plus,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

const SECTIONS = [
  {
    id: "start",
    icon: Plus,
    eyebrow: "Getting started",
    title: "Your first resume in five minutes",
    items: [
      {
        q: "How do I create a resume?",
        a: "Click New resume in the sidebar, or press ⌘N anywhere in the app. Pick a template, fill in your details section by section, and export when ready. The builder auto-saves everything.",
      },
      {
        q: "Which template should I pick?",
        a: "Any template works — they are all ATS-safe and professionally spaced. Classic is a safe default for most industries. You can switch templates any time without losing your content.",
      },
      {
        q: "Does my work save automatically?",
        a: "Yes. Every edit is saved to your account in real time. You can close the tab and come back — your resume will be exactly where you left it.",
      },
    ],
  },
  {
    id: "builder",
    icon: PencilLine,
    eyebrow: "Builder",
    title: "Writing, editing, and formatting",
    items: [
      {
        q: "How does the AI writing assistant work?",
        a: "Highlight any section or bullet and use the AI toolbar to generate suggestions, improve phrasing, or rewrite for a specific target role. The AI uses Groq for fast, low-latency responses.",
      },
      {
        q: "Can I undo changes?",
        a: "Yes — full undo and redo are supported. Press ⌘Z to step back and ⌘⇧Z to go forward. The history is per-session and resets on reload.",
      },
      {
        q: "How do I rename a resume?",
        a: "Click the title text at the top of the builder. It becomes an inline input — type the new name and press Enter or click away to save.",
      },
      {
        q: "What formatting is available?",
        a: "Bold, italic, underline, and bullet lists are available via the rich text toolbar inside each text field. All formatting is preserved when you export to PDF.",
      },
    ],
  },
  {
    id: "grader",
    icon: CheckSquare,
    eyebrow: "Resume Grader",
    title: "Scoring, feedback, and rewrites",
    items: [
      {
        q: "What does the Grader actually check?",
        a: "The Grader scores your resume across four dimensions: Formatting, Keywords, Impact, and Clarity. It also runs an ATS parse simulation, checks keyword coverage against your target role, and flags weak bullets for rewriting.",
      },
      {
        q: "Which review lens should I choose?",
        a: "ATS Strict is best before applying anywhere. HR Recruiter simulates a fast first-pass screen. Hiring Manager focuses on depth and evidence of impact. Campus Placement is tuned for internship and entry-level criteria.",
      },
      {
        q: "Can I grade someone else's resume?",
        a: "Yes. If the resume was shared via ResuMe, paste the public share link into the link input on the Grader page. No file upload needed.",
      },
      {
        q: "What is the Rewrites tab?",
        a: "The Rewrites tab lists every bullet the Grader flagged as weak and gives you an AI-generated stronger alternative for each one. You can copy rewrites straight into the builder.",
      },
      {
        q: "Does the Grader store my results?",
        a: "Yes — the History tab on the Grader page shows your previous grading sessions. Results are tied to your account.",
      },
    ],
  },
  {
    id: "sharing",
    icon: Link2,
    eyebrow: "Sharing",
    title: "Publishing and public links",
    items: [
      {
        q: "How do I get a shareable link?",
        a: "Open a resume from your dashboard and look for the Share card. Toggle sharing on to generate a permanent public URL. The link stays active as long as sharing is enabled.",
      },
      {
        q: "Who can see a shared resume?",
        a: "Anyone with the link. Shared resumes are public and do not require the viewer to have a ResuMe account.",
      },
      {
        q: "Can I turn off sharing later?",
        a: "Yes. Toggle sharing off in the dashboard card for that resume. The public link will stop working immediately.",
      },
    ],
  },
  {
    id: "export",
    icon: Download,
    eyebrow: "Export",
    title: "PDF output and ATS compatibility",
    items: [
      {
        q: "How do I export my resume to PDF?",
        a: "Open the builder and click Export, or use the Export page directly. The PDF is rendered with pixel-accurate output — every spacing and font choice in the builder is preserved exactly.",
      },
      {
        q: "Will my PDF pass ATS scanners?",
        a: "All templates are built to produce clean, parseable text. Avoid pasting in external rich content or images. Run the Grader in ATS Strict mode before submitting to catch any issues.",
      },
      {
        q: "Can I generate a cover letter too?",
        a: "Yes. The Cover Letter generator is available from the export panel in the builder. It reads your resume and produces a tailored letter for the target role you specify.",
      },
    ],
  },
  {
    id: "account",
    icon: User,
    eyebrow: "Account",
    title: "Profile, theme, and billing",
    items: [
      {
        q: "How do I change the app theme?",
        a: "Click your profile avatar at the bottom of the sidebar and use the Light / Dark toggle in the Appearance section of the menu. Your preference is saved locally and persists across sessions.",
      },
      {
        q: "What is the accent color option?",
        a: "You can switch between Blue (the default) and Mono (grayscale). Mono gives the UI a minimal, print-inspired look. Toggle it in the same Appearance section.",
      },
      {
        q: "How do I update my display name or photo?",
        a: "Go to Profile settings from the account menu. Changes apply immediately across the app and to any shared resumes.",
      },
    ],
  },
];

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Command palette" },
  { keys: ["⌘", "Z"], label: "Undo" },
  { keys: ["⌘", "⇧", "Z"], label: "Redo" },
  { keys: ["⌘", "B"], label: "Bold" },
  { keys: ["⌘", "I"], label: "Italic" },
  { keys: ["⌘", "U"], label: "Underline" },
  { keys: ["Esc"], label: "Close menu / popover" },
];

export default function HelpDocs() {
  return (
    <div className="app-page app-page-narrow fade-in">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="lbl-mono mb-2">Help &amp; Docs</div>
          <h1 className="h-display m-0 text-[30px]">
            Everything you need to know about{" "}
            <span className="serif italic font-normal text-[var(--accent)]">ResuMe.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--muted)]">
            Quick answers for the builder, grader, export, sharing, and your account.
          </p>
        </div>
        <div className="panel inline-flex w-fit max-w-full items-center gap-2.5 self-start whitespace-nowrap px-3 py-2 md:self-auto">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
            <HelpCircle size={15} className="text-[var(--muted)]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium leading-tight text-[var(--text)]">FAQ</div>
            <div className="text-[11px] leading-tight text-[var(--muted)]">Updated May 2025</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section) => (
          <HelpSection key={section.id} section={section} />
        ))}

        <ShortcutsCard />
      </div>

      <div className="panel mt-4 flex items-center gap-4 p-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Sparkles size={16} className="text-[var(--accent)]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium text-[var(--text)]">Something still unclear?</div>
          <div className="text-[12px] text-[var(--muted)]">
            This page is updated as new features ship. Check{" "}
            <span className="font-medium text-[var(--text-2)]">What&rsquo;s new</span> for the latest changes.
          </div>
        </div>
      </div>
    </div>
  );
}

function HelpSection({ section }) {
  const Icon = section.icon;
  return (
    <article className="panel p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Icon size={16} className="text-[var(--muted)]" />
        </div>
        <div>
          <div className="lbl-mono mb-1">{section.eyebrow}</div>
          <h2 className="m-0 text-[17px] font-semibold text-[var(--text)]">{section.title}</h2>
        </div>
      </div>
      <div className="space-y-3">
        {section.items.map((item) => (
          <QAItem key={item.q} item={item} />
        ))}
      </div>
    </article>
  );
}

function QAItem({ item }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-1.5 flex items-start gap-2">
        <ArrowRight size={13} className="mt-[3px] shrink-0 text-[var(--faint)]" />
        <span className="text-[13px] font-semibold text-[var(--text)]">{item.q}</span>
      </div>
      <p className="m-0 pl-5 text-[13px] leading-relaxed text-[var(--muted)]">{item.a}</p>
    </div>
  );
}

function ShortcutsCard() {
  return (
    <article className="panel p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <Keyboard size={16} className="text-[var(--muted)]" />
        </div>
        <div>
          <div className="lbl-mono mb-1">Shortcuts</div>
          <h2 className="m-0 text-[17px] font-semibold text-[var(--text)]">Keyboard shortcuts</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SHORTCUTS.map((shortcut) => (
          <div
            key={shortcut.label}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5"
          >
            <span className="text-[13px] text-[var(--text-2)]">{shortcut.label}</span>
            <div className="flex items-center gap-1">
              {shortcut.keys.map((key) => (
                <kbd
                  key={key}
                  className="mono flex h-[22px] min-w-[22px] items-center justify-center rounded border border-[var(--border-strong)] bg-[var(--bg)] px-1.5 text-[11px] text-[var(--text)]"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
