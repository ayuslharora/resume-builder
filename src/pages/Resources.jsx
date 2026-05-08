import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  SearchCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

const verbGroups = [
  {
    label: "Leadership",
    words: ["Directed", "Coached", "Organized", "Spearheaded", "Coordinated", "Mentored"],
  },
  {
    label: "Engineering",
    words: ["Built", "Automated", "Optimized", "Shipped", "Debugged", "Refactored"],
  },
  {
    label: "Analysis",
    words: ["Measured", "Audited", "Modeled", "Forecasted", "Synthesized", "Prioritized"],
  },
];

const checklist = [
  "Use standard headers: Experience, Education, Skills, Projects.",
  "Mirror the job title and must-have skills where they are truthful.",
  "Keep bullets outcome-first with metrics, scope, or business impact.",
  "Export as PDF unless the employer asks for another format.",
];

const mistakes = [
  "Opening with a vague objective instead of a role-focused summary.",
  "Listing tools without showing where they produced an outcome.",
  "Using dense paragraphs that make achievements hard to scan.",
  "Adding graphics, tables, or columns that can confuse parsers.",
];

const formulas = [
  {
    title: "Impact bullet",
    pattern: "Action + scope + metric + result",
    example: "Optimized onboarding flow for 12K users, reducing drop-off by 18%.",
  },
  {
    title: "Project bullet",
    pattern: "Built + stack + user problem + proof",
    example: "Built a React dashboard that surfaced weekly hiring signals for 6 recruiters.",
  },
  {
    title: "Keyword bullet",
    pattern: "Skill + context + measurable use",
    example: "Applied SQL and cohort analysis to identify retention gaps across 4 plans.",
  },
];

const focusCards = [
  {
    icon: <Target size={16} className="text-primary" />,
    eyebrow: "Role fit",
    title: "Match the target job first",
    body: "Start with the job description, pull out repeated nouns and required skills, then map each one to a real project or role.",
  },
  {
    icon: <SearchCheck size={16} className="text-primary" />,
    eyebrow: "ATS scan",
    title: "Make parsing boring",
    body: "Use plain section names, simple dates, readable bullets, and text that can be selected after export.",
  },
  {
    icon: <ClipboardCheck size={16} className="text-primary" />,
    eyebrow: "Review pass",
    title: "Cut anything unsupported",
    body: "Every line should prove skill, scope, ownership, or outcome. If it only sounds nice, remove it.",
  },
];

export default function Resources() {
  return (
    <div className="app-page app-page-narrow fade-in">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="lbl-mono mb-2">Resources</div>
          <h1 className="h-display m-0 text-[30px]">Build a resume recruiters can scan.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            Use these quick references when writing bullets, checking ATS readability, and tightening a resume before export.
          </p>
        </div>
        <div
          aria-label="Writing desk resource type"
          className="panel inline-flex w-fit max-w-full items-center gap-2.5 self-start whitespace-nowrap px-3 py-2 md:self-auto"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)]">
            <BookOpen size={15} className="text-[var(--muted)]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-medium leading-tight text-[var(--text)]">Writing desk</div>
            <div className="text-[11px] leading-tight text-[var(--muted)]">Bullet prompts and ATS checks</div>
          </div>
        </div>
      </div>

      <section className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {focusCards.map((card) => (
          <FocusCard key={card.title} {...card} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_0.86fr]">
        <div className="space-y-4">
          <ResourceCard
            icon={<Zap size={17} className="text-primary" />}
            label="Action verbs"
            title="Choose verbs that show ownership"
            trailing={<span className="pill pill-accent">18 verbs</span>}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {verbGroups.map((group) => (
                <div key={group.label} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
                  <div className="mb-2 text-sm font-medium text-[var(--text)]">{group.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.words.map((word) => (
                      <span key={word} className="pill">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ResourceCard>

          <ResourceCard
            icon={<Sparkles size={17} className="text-primary" />}
            label="Bullet formulas"
            title="Turn responsibilities into evidence"
          >
            <div className="space-y-3">
              {formulas.map((formula) => (
                <div key={formula.title} className="rounded-lg border border-[var(--border)] p-4">
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="m-0 text-sm font-semibold text-[var(--text)]">{formula.title}</h3>
                    <span className="pill">{formula.pattern}</span>
                  </div>
                  <p className="m-0 text-sm leading-relaxed text-[var(--muted)]">{formula.example}</p>
                </div>
              ))}
            </div>
          </ResourceCard>
        </div>

        <div className="space-y-4">
          <ResourceCard
            icon={<CheckCircle2 size={17} className="text-[var(--good)]" />}
            label="ATS checklist"
            title="Before you submit"
          >
            <div className="space-y-3">
              {checklist.map((item) => (
                <ChecklistItem key={item} tone="good" text={item} />
              ))}
            </div>
          </ResourceCard>

          <ResourceCard
            icon={<AlertTriangle size={17} className="text-[var(--warn)]" />}
            label="Common mistakes"
            title="Remove these first"
          >
            <div className="space-y-3">
              {mistakes.map((item) => (
                <ChecklistItem key={item} tone="warn" text={item} />
              ))}
            </div>
          </ResourceCard>

          <div className="panel p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                <FileText size={17} className="text-[var(--muted)]" />
              </div>
              <div>
                <div className="lbl-mono mb-1">Quick pass</div>
                <h2 className="m-0 text-[18px] font-semibold text-[var(--text)]">The 60-second review</h2>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[var(--muted)]">
              {["Is the target role obvious?", "Can every bullet be defended?", "Does the first page carry the strongest proof?"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg bg-[var(--surface)] px-3 py-2">
                  <ArrowRight size={13} className="shrink-0 text-[var(--faint)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FocusCard({ icon, eyebrow, title, body }) {
  return (
    <article className="panel p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <span className="lbl-mono">{eyebrow}</span>
      </div>
      <h2 className="m-0 text-[15px] font-semibold text-[var(--text)]">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{body}</p>
    </article>
  );
}

function ResourceCard({ icon, label, title, trailing, children }) {
  return (
    <article className="panel p-5">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            {icon}
          </div>
          <div>
            <div className="lbl-mono mb-1">{label}</div>
            <h2 className="m-0 text-[18px] font-semibold text-[var(--text)]">{title}</h2>
          </div>
        </div>
        {trailing}
      </div>
      {children}
    </article>
  );
}

function ChecklistItem({ tone, text }) {
  const Icon = tone === "good" ? CheckCircle2 : AlertTriangle;
  const color = tone === "good" ? "var(--good)" : "var(--warn)";

  return (
    <div className="flex gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
      <Icon size={16} className="mt-0.5 shrink-0" style={{ color }} />
      <p className="m-0 text-sm leading-relaxed text-[var(--text-2)]">{text}</p>
    </div>
  );
}
