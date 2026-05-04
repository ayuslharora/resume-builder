export const HOME_SEO_BADGE = 'ATS-Optimized Resumes'

export const HOME_SEO_TITLE = 'Free AI Resume Builder'

export const HOME_SEO_DESCRIPTION =
  'ResuMe is a free ATS-focused resume builder and grader for students, fresh graduates, and early-career professionals.'

export const HOME_AUTHOR_NAME = 'Ayush'
export const HOME_AUTHOR_URL = 'https://Ayuslh.in/'

export const HOME_SEO_TRUST = [
  'ATS Compliant',
  'AI-Powered',
  'Pro Templates',
]

export const HOME_SEO_SECTIONS = [
  {
    title: 'Audience fit',
    body:
      'Students, career switchers, and working professionals can use ResuMe to turn rough experience into a cleaner resume for one specific job post. The app is aimed at people who want a fast, structured path from draft to submission without paying for a separate builder and grader.',
  },
  {
    title: 'ATS methodology',
    body:
      'ResuMe looks at the target role, surfaces the keywords that matter, and keeps the structure easy for applicant tracking systems to parse. That means the advice is focused on role alignment, readable formatting, and clear evidence of impact rather than design-heavy decoration.',
  },
  {
    title: 'Differentiation',
    body:
      'ResuMe combines resume creation and resume grading in one flow, so you can rewrite and check your resume without switching tools. Most resume tools only build or only score; this one gives you both steps in the same workflow for quicker iteration.',
  },
  {
    title: 'Limitations',
    body:
      'No tool can promise interviews, and highly unusual formatting or missing job context can reduce the quality of the result. ResuMe is intentionally opinionated toward ATS-friendly resumes, so it is not the right fit for portfolios, graphic layouts, or design-first applications.',
  },
]

export const HOME_SEO_FAQ = [
  {
    question: 'Can I start with a rough draft?',
    answer:
      'Yes. The app helps turn a rough summary of your work into a more job-ready resume, then shows the next changes that are most likely to help.',
  },
  {
    question: 'What does the grader look at?',
    answer:
      'It checks keywords, formatting, and structure, then gives clear next steps for improvement so users can move from a vague draft to a more ATS-friendly resume.',
  },
]

export const HOME_SEO_CITABLE_BLOCKS = [
  {
    heading: 'What is ResuMe?',
    body:
      'ResuMe is a free ATS-focused resume builder and grader for students, fresh graduates, and early-career professionals. It helps a user move from rough notes to a cleaner resume, tailor that resume to a specific role, and check the result in one workflow. The goal is speed and clarity, not fancy layout control. Public pages are available without an account, while the builder, export tools, and cover-letter flow require sign-in. ResuMe is intentionally opinionated toward resumes that applicant tracking systems can parse, so it is a better fit for engineering, corporate, and campus-placement applications than for graphic or portfolio-style documents.',
  },
  {
    heading: 'How does the ATS grader work?',
    body:
      'The ATS grader is designed to highlight the same signals a recruiter or screening system usually cares about first: role alignment, keyword coverage, formatting safety, and structure. ResuMe takes the target role into account, then turns the resume into specific suggestions that are easier to act on than generic advice. It does not promise interviews or replace human judgment, but it does give a fast way to find weak bullets, confusing sections, and layout choices that may be harder for screening systems to read. That makes it useful when a user already has experience but needs help translating it into clearer, job-ready language.',
  },
]

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function buildList(items, className = '') {
  const resolvedClassName = className || 'list-disc pl-5 space-y-1 text-sm leading-relaxed text-on-surface-variant'
  return `<ul class="${resolvedClassName}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
}

export function buildHomepageStaticHtml() {
  const trustItems = HOME_SEO_TRUST.map(
    (item) =>
      `<span class="inline-flex items-center gap-1.5 text-xs text-on-surface-variant"><span class="text-primary">•</span><span>${escapeHtml(item)}</span></span>`,
  ).join('')

  const sectionMarkup = HOME_SEO_SECTIONS.map(
    (section) => `
      <article class="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h3 class="text-sm font-semibold text-on-surface">${escapeHtml(section.title)}</h3>
        <p class="mt-3 text-sm leading-relaxed text-on-surface-variant">${escapeHtml(section.body)}</p>
      </article>
    `,
  ).join('')

  const citableMarkup = HOME_SEO_CITABLE_BLOCKS.map(
    (block) => `
      <article class="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <h2 class="text-base font-semibold text-on-surface">${escapeHtml(block.heading)}</h2>
        <p class="mt-3 text-sm leading-relaxed text-on-surface-variant">${escapeHtml(block.body)}</p>
      </article>
    `,
  ).join('')

  return `
    <div id="homepage-static-shell" class="landing-desktop-shell min-h-screen fade-in relative overflow-x-hidden">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="orb w-[600px] h-[600px] bg-cyan-500/10 -top-64 -left-48 animate-float-slow"></div>
        <div class="orb w-[500px] h-[500px] bg-blue-600/8 -bottom-48 -right-48 animate-float-medium" style="animation-delay:-3s"></div>
        <div class="orb w-[300px] h-[300px] bg-cyan-400/6 top-1/3 right-1/4 animate-pulse-glow" style="animation-delay:-1.5s"></div>
        <div class="orb w-[200px] h-[200px] bg-blue-500/8 bottom-1/3 left-1/4 animate-float-fast" style="animation-delay:-2s"></div>
      </div>

      <div class="landing-page-content">
        <div class="w-full max-w-7xl relative z-10 flex flex-col gap-6 px-6 pt-6 pb-8 xl:gap-8">
          <div class="landing-hero-grid w-full">
          <section class="landing-hero-panel w-full max-w-3xl space-y-5 text-center flex flex-col items-center">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest" style="background:rgba(6,182,212,0.08);border-color:rgba(6,182,212,0.2);color:#06b6d4;backdrop-filter:blur(8px);box-shadow:0 0 16px rgba(6,182,212,0.15)">
              <span aria-hidden="true">✦</span>
              ${escapeHtml(HOME_SEO_BADGE)}
            </div>

            <div class="space-y-4">
              <h1 class="text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-on-surface leading-[1.02]">
                ${escapeHtml(HOME_SEO_TITLE)} <span style="background:linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 20px rgba(6,182,212,0.4))">with ATS grading</span>
              </h1>

              <p class="text-base sm:text-lg xl:text-[1.08rem] text-on-surface-variant max-w-xl leading-relaxed">
                ${escapeHtml(HOME_SEO_DESCRIPTION)}
              </p>
            </div>

            <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a href="/signup" class="w-full sm:w-auto btn-primary px-8 py-3.5 text-base">Start Building Free</a>
              <a href="/login" class="w-full sm:w-auto btn-ghost px-8 py-3.5 text-base text-on-surface">Log In</a>
            </div>

            <div class="flex items-center justify-center lg:justify-start gap-5 pt-1 flex-wrap">
              ${trustItems}
            </div>
          </section>

          <aside class="landing-feature-panel w-full max-w-[440px] lg:justify-self-end lg:mt-6 rounded-[1.5rem] p-5.5 xl:p-6 relative glass-strong">
            <div class="relative space-y-3.5">
              <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-bold" style="background:rgba(6,182,212,0.1);color:#06b6d4;border:1px solid rgba(6,182,212,0.15)">
                FREE TOOL
              </div>
              <div class="space-y-2.5">
                <h2 class="text-2xl xl:text-[1.7rem] font-bold text-on-surface">Resume Grader</h2>
                <p class="text-on-surface-variant text-[0.95rem] leading-relaxed max-w-md">
                  Turn any uploaded resume into a scored, ATS-aware report with clear fixes you can act on in minutes.
                </p>
              </div>
              <div class="rounded-2xl p-4 space-y-3 bg-white/[0.03] border border-white/[0.06]">
                <p class="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">What it checks</p>
                ${buildList(['Keywords aligned to the target role', 'Readable structure and formatting', 'Specific rewrite suggestions'])}
              </div>
              <div class="flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-on-surface-variant">
                <span>PDF/DOCX</span><span>•</span><span>Instant Feedback</span><span>•</span><span>ATS Checks</span>
              </div>
              <div class="flex flex-col gap-2">
                <a href="/grader" class="inline-flex w-full items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-on-surface transition-all duration-200 bg-white/[0.05] border border-white/[0.1]">
                  Grade My Resume
                </a>
              </div>
            </div>
          </aside>
        </div>

          <div class="grid gap-6 xl:grid-cols-12">
            <section class="landing-seo-grid relative z-10 w-full rounded-[1.5rem] p-4 sm:p-5 xl:col-span-7 glass" aria-labelledby="landing-seo-heading-static">
            <div class="flex flex-col gap-3">
              <div class="space-y-1">
                <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Public SEO</p>
                <h2 id="landing-seo-heading-static" class="text-xl sm:text-2xl font-bold text-on-surface">
                  Built for people searching for resume help
                </h2>
              </div>
              <p class="max-w-2xl text-sm text-on-surface-variant leading-relaxed">
                These sections explain who ResuMe is for, how the ATS workflow works, where it differs, and what it does not promise.
              </p>
            </div>

            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              ${sectionMarkup}
            </div>
          </section>

            <section class="landing-citable-grid relative z-10 w-full rounded-[1.5rem] p-4 sm:p-5 xl:col-span-5" style="background:rgba(8, 15, 31, 0.46);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.06);box-shadow:0 14px 36px rgba(0,0,0,0.16)" aria-labelledby="landing-citable-heading-static">
            <div class="max-w-2xl space-y-1">
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Citation Blocks</p>
              <h2 id="landing-citable-heading-static" class="text-xl sm:text-2xl font-bold text-on-surface">
                Self-contained answers for AI search
              </h2>
            </div>

            <div class="mt-4 grid gap-3">
              ${citableMarkup}
            </div>
            </section>
          </div>
        </div>
      </div>

      <div class="landing-credit-marquee">
        <div class="landing-credit-inner">
          <div class="landing-credit-track">
            <div class="landing-credit-segment">
              <span class="landing-credit-item"><span>Built and designed by Ayush</span><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><a href="https://Ayuslh.in" target="_blank" rel="noreferrer" class="transition-colors hover:text-primary">Ayuslh.in</a><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><span>Built and designed by Ayush</span><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><a href="https://Ayuslh.in" target="_blank" rel="noreferrer" class="transition-colors hover:text-primary">Ayuslh.in</a><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><span>Built and designed by Ayush</span><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><a href="https://Ayuslh.in" target="_blank" rel="noreferrer" class="transition-colors hover:text-primary">Ayuslh.in</a><span class="landing-credit-separator">•</span></span>
            </div>
            <div class="landing-credit-segment" aria-hidden="true">
              <span class="landing-credit-item"><span>Built and designed by Ayush</span><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><a href="https://Ayuslh.in" target="_blank" rel="noreferrer" class="transition-colors hover:text-primary">Ayuslh.in</a><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><span>Built and designed by Ayush</span><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><a href="https://Ayuslh.in" target="_blank" rel="noreferrer" class="transition-colors hover:text-primary">Ayuslh.in</a><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><span>Built and designed by Ayush</span><span class="landing-credit-separator">•</span></span>
              <span class="landing-credit-item"><a href="https://Ayuslh.in" target="_blank" rel="noreferrer" class="transition-colors hover:text-primary">Ayuslh.in</a><span class="landing-credit-separator">•</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `.trim()
}
