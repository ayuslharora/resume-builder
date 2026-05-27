export const HOME_SEO_BADGE = 'ATS-Optimized Resumes'

export const HOME_SEO_TITLE = 'Unlimited AI Resume Builder'

export const HOME_SEO_DESCRIPTION =
  'Build a tailored, ATS-ready resume in minutes — not hours. AI generation, ATS grading, and smart rewrites for students, fresh graduates, and early-career professionals.'

export const HOME_AUTHOR_NAME = 'Ayush'
export const HOME_AUTHOR_URL = 'https://Ayuslh.in/'

export const HOME_SEO_TRUST = [
  'ATS Compliant',
  'AI-Powered',
  'Pro Templates',
]

export const HOME_TARGET_COMPANIES = [
  'Stripe',
  'Linear',
  'Notion',
  'Vercel',
  'Razorpay',
  'Atlassian',
  'Figma',
]

export const HOME_LANDING_FEATURES = [
  {
    title: 'AI builder',
    body:
      'Describe the role you want. ResuMe turns your real experience into a focused resume draft without generic filler.',
  },
  {
    title: 'ATS grader',
    body:
      'Score your resume out of 100 against any job description, then see exactly what to fix first.',
  },
  {
    title: 'Share & track',
    body:
      'Share your resume via a link and see who read it — views, locations, time spent, and which links they clicked.',
  },
  {
    title: 'Inline editor',
    body:
      'Edit sections directly, keep the resume readable, and move from draft to export without losing context.',
  },
  {
    title: 'Targeted rewrites',
    body:
      'Improve a single bullet for stronger impact, compare the result, and keep the version that fits the role.',
  },
  {
    title: 'Cover letter',
    body:
      'Generate a tailored cover letter from your resume and a job description in seconds. No fluff, no filler.',
  },
]

export const HOME_LANDING_METRICS = [
  {
    value: '100%',
    label: 'Recruiter-ready structures',
  },
  {
    value: '92',
    suffix: '/100',
    label: 'Average ATS score',
  },
  {
    value: '2.4x',
    label: 'More callbacks vs. baseline',
  },
  {
    value: '< 4 min',
    label: 'To a tailored draft',
  },
]

export const HOME_TEMPLATE_PREVIEWS = [
  {
    id: 'minimal',
    name: 'Minimal',
    desc: 'Clean and distraction-free',
    image: '/templates/minimal.png',
  },
  {
    id: 'modern',
    name: 'Modern',
    desc: 'Bold typography with accents',
    image: '/templates/modern.png',
  },
  {
    id: 'professional',
    name: 'Professional',
    desc: 'Classic corporate structure',
    image: '/templates/professional.png',
  },
  {
    id: 'creative',
    name: 'Creative',
    desc: 'Vibrant and asymmetrical',
    image: '/templates/creative.png',
  },
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
      'ResuMe is an open-access ATS-focused resume builder and grader for students, fresh graduates, and early-career professionals. It helps a user move from rough notes to a cleaner resume, tailor that resume to a specific role, and check the result in one workflow. The goal is speed and clarity, not fancy layout control. Public pages are available without an account, while the builder, export tools, and cover-letter flow require sign-in. ResuMe is intentionally opinionated toward resumes that applicant tracking systems can parse, so it is a better fit for engineering, corporate, and campus-placement applications than for graphic or portfolio-style documents.',
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

function buildHeroScoreBars() {
  return [
    ['Formatting', 92],
    ['Keywords', 78],
    ['Impact', 88],
    ['Clarity', 91],
  ].map(([label, value]) => `
    <div>
      <div class="mb-1 flex justify-between text-[11px] text-[var(--text-2)]">
        <span>${escapeHtml(label)}</span>
        <span class="mono text-[var(--muted)]">${value}</span>
      </div>
      <div class="scorebar"><i style="width:${value}%"></i></div>
    </div>
  `).join('')
}

function buildBrandMarkup() {
  return `
    <a href="/" class="flex items-center gap-2">
      <div class="flex h-[26px] w-[26px] items-center justify-center overflow-hidden rounded-[7px]" style="box-shadow:0 1px 2px rgba(15,23,42,.16)">
        <img src="/favicon.svg" alt="" aria-hidden="true" style="height:100%;width:100%;display:block">
      </div>
      <span class="text-[15px] font-semibold tracking-[-0.01em]">Resu<span class="serif italic font-normal">Me</span></span>
    </a>
  `.trim()
}

function buildCompanyTickerSegment() {
  return HOME_TARGET_COMPANIES.map((company) => `<span>${escapeHtml(company)}</span>`).join('')
}

export function buildHomepageStaticHtml() {
  const trustItems = HOME_SEO_TRUST.map(
    (item) =>
      `<span class="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)]"><span class="text-[var(--accent)]">✓</span><span>${escapeHtml(item)}</span></span>`,
  ).join('')

  const companyTickerSegment = buildCompanyTickerSegment()

  const featureMarkup = HOME_LANDING_FEATURES.map(
    (section) => `
      <article class="bg-[var(--bg)] p-7">
        <div class="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-sm font-semibold text-[var(--accent)]">+</div>
        <h3 class="m-0 text-base font-semibold text-[var(--text)]">${escapeHtml(section.title)}</h3>
        <p class="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">${escapeHtml(section.body)}</p>
      </article>
    `,
  ).join('')

  const metricMarkup = HOME_LANDING_METRICS.map(
    (metric) => `
      <div>
        <div class="h-display text-[40px] leading-none">
          ${escapeHtml(metric.value)}${metric.suffix ? `<span class="text-[22px] text-[var(--muted)]">${escapeHtml(metric.suffix)}</span>` : ''}
        </div>
        <div class="mt-1.5 text-[12.5px] text-[var(--muted)]">${escapeHtml(metric.label)}</div>
      </div>
    `,
  ).join('')

  const templateMarkup = HOME_TEMPLATE_PREVIEWS.map(
    (template, index) => `
      <article class="panel lift bg-[var(--surface)] p-3.5">
        <div class="mb-3 aspect-[0.75] overflow-hidden rounded-md border border-[var(--border)] bg-white p-3.5">
          <img src="${escapeHtml(template.image)}" alt="${escapeHtml(template.name)} resume template preview" class="h-full w-full rounded-sm object-contain" loading="lazy" />
        </div>
        <div class="flex items-baseline justify-between gap-2">
          <h3 class="m-0 text-sm font-semibold text-[var(--text)]">${escapeHtml(template.name)}</h3>
          <span class="lbl-mono text-[10px]">0${index + 1}</span>
        </div>
        <p class="mt-1 text-xs text-[var(--muted)]">${escapeHtml(template.desc)}</p>
      </article>
    `,
  ).join('')

  const seoOnlyMarkup = [
    ...HOME_SEO_CITABLE_BLOCKS.map(
      (block) => `
        <article>
          <h2>${escapeHtml(block.heading)}</h2>
          <p>${escapeHtml(block.body)}</p>
        </article>
      `,
    ),
    ...HOME_SEO_FAQ.map(
      (item) => `
        <article>
          <h2>${escapeHtml(item.question)}</h2>
          <p>${escapeHtml(item.answer)}</p>
        </article>
      `,
    ),
  ].join('')

  const mobileNavMarkup = [
    { label: 'Product', href: '/', current: true },
    { label: 'Templates', href: '/templates' },
    { label: 'Grader', href: '/grader-info' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Contact', href: '/contact' },
  ].map(
    (item) => `
      <a href="${item.href}" class="landing-mobile-nav-link"${item.current ? ' aria-current="page"' : ''}>
        ${item.label}
      </a>
    `,
  ).join('')

  return `
    <div id="homepage-static-shell" class="app-design min-h-screen bg-[var(--bg)]">
      <header class="sticky top-0 z-30 border-b border-[var(--border)]" style="background:color-mix(in oklch, var(--bg) 78%, transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)">
        <div class="container" style="display:flex;align-items:center;height:64px;gap:24px">
          ${buildBrandMarkup()}
          <nav class="hidden md:flex" style="gap:22px;margin-left:32px">
            <a href="/" class="ulink text-[13.5px] text-[var(--text-2)]">Product</a>
            <a href="/templates" class="ulink text-[13.5px] text-[var(--text-2)]">Templates</a>
            <a href="/grader-info" class="ulink text-[13.5px] text-[var(--text-2)]">Grader</a>
            <a href="/pricing" class="ulink text-[13.5px] text-[var(--text-2)]">Pricing</a>
            <a href="/contact" class="ulink text-[13.5px] text-[var(--text-2)]">Contact</a>
          </nav>
          <span class="flex-1"></span>
          <div class="flex items-center gap-3">
            <button
              id="static-theme-toggle"
              aria-label="Toggle theme"
              class="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--border-strong)] text-[var(--text-2)] hover:bg-[var(--surface)] hover:text-[var(--text)] transition-colors"
            >
              <svg id="theme-icon-sun" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
              <svg id="theme-icon-moon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            </button>
            <div class="h-4 w-px bg-[var(--border)] mx-1 hidden sm:block"></div>
            <a href="/login" class="btn btn-outline btn-sm">Log in</a>
            <a href="/signup" class="btn btn-primary btn-sm">Get started</a>
          </div>
        </div>
      </header>
      <details class="landing-mobile-nav md:hidden">
        <summary class="landing-mobile-nav-trigger" aria-label="Open navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/></svg>
        </summary>
        <div class="landing-mobile-nav-backdrop" aria-hidden="true"></div>
        <nav class="landing-mobile-nav-panel" aria-label="Landing sections">
          ${mobileNavMarkup}
        </nav>
      </details>

      <main>
        <section id="product" class="container" style="padding-top:88px;padding-bottom:96px">
          <style>
            .landing-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
            @media (max-width:1024px){.landing-hero-grid{grid-template-columns:1fr;gap:48px}.landing-hero-grid .landing-hero-visual-wrap{max-width:560px;margin-left:0}}
            .landing-features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px}
            @media (max-width:900px){.landing-features-grid{grid-template-columns:repeat(2,1fr)}.landing-templates-grid{grid-template-columns:repeat(2,1fr)}}
            @media (max-width:600px){.landing-features-grid{grid-template-columns:1fr}}
            .landing-templates-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
            .landing-metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:32px}
            @media (max-width:700px){.landing-metric-grid{grid-template-columns:repeat(2,1fr);gap:24px}}
          </style>
          <div class="landing-hero-grid">
            <div>
              <h1 class="h-display" style="font-size:clamp(40px,5.6vw,72px);line-height:1.02;margin:0;letter-spacing:-0.035em">
                ${escapeHtml(HOME_SEO_TITLE)} <span class="serif italic font-normal text-[var(--accent)]">with ATS grading.</span>
              </h1>
              <p style="font-size:17.5px;line-height:1.55;color:var(--text-2);margin-top:22px;max-width:540px">
                ${escapeHtml(HOME_SEO_DESCRIPTION)}
              </p>
              <div style="display:flex;gap:10px;margin-top:32px;flex-wrap:wrap">
                <a href="/signup" class="btn btn-accent btn-lg">Start Building Now</a>
                <a href="/grader" class="btn btn-outline btn-lg">Grade My Resume</a>
              </div>
              <div style="margin-top:28px;display:flex;gap:22px;color:var(--muted);font-size:12.5px;flex-wrap:wrap">
                ${trustItems}
              </div>
            </div>

            <div class="landing-hero-visual-wrap">
            <div style="position:relative;aspect-ratio:1.05;max-width:560px;margin-left:auto;min-width:0">
              <div class="absolute inset-0 rounded-[18px] border border-[var(--border)] bg-[var(--surface)]" style="background-image:radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--border-strong) 60%, transparent) 1px, transparent 0);background-size:20px 20px"></div>
              <div class="paper absolute left-[8%] top-[8%] aspect-[0.78] w-[62%] rounded-lg px-[22px] py-6 text-[11px] leading-[1.45]" style="transform:rotate(-2.5deg)">
                <div class="serif text-[22px] font-semibold leading-none">Aarav Mehta</div>
                <div class="mt-1 text-[10px] text-[#71717a]">Senior Frontend · aarav@mehta.dev · Bengaluru</div>
                <div class="my-3 h-px bg-[#ececef]"></div>
                <div class="mb-1 text-[9px] font-semibold uppercase text-[var(--accent)]">Experience</div>
                <div class="text-[11px] font-semibold">Razorpay · Senior Frontend</div>
                <div class="mb-1 text-[9px] text-[#71717a]">Aug 2022 - Present</div>
                ${buildList(['Owned onboarding redesign, raising activation by 18%.', 'Built component kit used by 9 product teams.', 'Trimmed dashboard TTI from 4.2s to 1.3s.'], 'm-0 list-disc pl-4 text-[10px] leading-relaxed text-[#27272a]')}
                <div class="mb-1 mt-2 text-[9px] font-semibold uppercase text-[var(--accent)]">Skills</div>
                <div class="flex flex-wrap gap-1">
                  ${['TypeScript', 'React', 'Next.js', 'GraphQL', 'Tailwind', 'Vite'].map((skill) => `<span class="rounded bg-[#f4f4f5] px-1.5 py-0.5 text-[9px]">${escapeHtml(skill)}</span>`).join('')}
                </div>
              </div>
              <div id="grader" class="panel absolute right-[4%] top-[32%] w-[52%] rounded-[14px] p-[18px]" style="transform:rotate(2deg);--bg:#ffffff;--surface:#fafafa;--surface-2:#f4f4f5;--border:#ececef;--border-strong:#d4d4d8;--text:#0a0a0b;--text-2:#3f3f46;--muted:#71717a;--accent:#2563eb;--accent-soft:#eff6ff;--accent-fg:#ffffff;--good:#15803d;--good-soft:#ecfdf5;color:var(--text)">
                <div class="mb-4 flex items-center justify-between">
                  <span class="lbl-mono">ATS Grade</span>
                  <span class="pill pill-good"><span class="dot" style="background:currentColor"></span>Strong</span>
                </div>
                <div class="flex items-baseline gap-2">
                  <span class="h-display text-[56px] leading-none">87</span>
                  <span class="text-[var(--muted)]">/100</span>
                </div>
                <div class="mt-4 space-y-3">
                  ${buildHeroScoreBars()}
                </div>
                <div class="absolute -bottom-5 -left-5 hidden items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 shadow-[var(--shadow-md)] sm:flex" style="transform:rotate(-2deg)">
                  <span class="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[var(--accent-soft)] text-[var(--accent)]">+</span>
                  <span>
                    <span class="block text-xs font-medium text-[var(--text)]">Rewrote 3 bullets</span>
                    <span class="block text-[10.5px] text-[var(--muted)]">+12 impact score</span>
                  </span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        <section style="border-top:1px solid var(--border);border-bottom:1px solid var(--border)">
          <div class="container landing-company-row" style="display:flex;align-items:center;gap:36px;padding:20px 24px;overflow:hidden">
            <span class="lbl-mono" style="flex-shrink:0">Trusted by candidates targeting roles at</span>
            <div class="landing-company-ticker" aria-label="Companies candidates target: ${HOME_TARGET_COMPANIES.map(escapeHtml).join(', ')}">
              <div class="landing-company-track" aria-hidden="true">
                <div class="landing-company-segment">${companyTickerSegment}</div>
                <div class="landing-company-segment">${companyTickerSegment}</div>
              </div>
            </div>
          </div>
        </section>

        <section class="container" style="padding-top:96px;padding-bottom:64px" aria-labelledby="features-heading">
          <div style="max-width:720px;margin-bottom:56px">
            <div class="lbl-mono" style="margin-bottom:12px">What you get</div>
            <h2 id="features-heading" class="h-display" style="font-size:40px;letter-spacing:-0.025em;margin:0;line-height:1.1">Every step of the resume, sharpened.</h2>
          </div>
          <div class="landing-features-grid" style="background:var(--border);border:1px solid var(--border);border-radius:14px;overflow:hidden">
            ${featureMarkup}
          </div>
        </section>

        <section class="container" style="padding-top:32px;padding-bottom:64px">
          <div class="panel landing-metric-grid" style="padding:32px">
            ${metricMarkup}
          </div>
        </section>

        <section id="templates" class="container" style="padding-top:64px;padding-bottom:96px" aria-labelledby="templates-heading">
          <div style="display:flex;align-items:end;gap:24px;margin-bottom:32px;flex-wrap:wrap">
            <div style="flex:1">
              <div class="lbl-mono" style="margin-bottom:12px">Templates</div>
              <h2 id="templates-heading" class="h-display" style="font-size:36px;letter-spacing:-0.025em;margin:0">Pick a starting point. Switch any time.</h2>
            </div>
            <a href="/templates" class="btn btn-outline">Browse all</a>
          </div>
          <div class="landing-templates-grid">
            ${templateMarkup}
          </div>
        </section>

        <section class="sr-only" aria-label="ResuMe public search answers">
          ${seoOnlyMarkup}
        </section>

        <section id="pricing" class="container" style="padding-bottom:96px">
          <div style="border-radius:18px;padding:56px 48px;background:linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%);border:1px solid var(--border);text-align:center">
            <h2 class="h-display" style="font-size:clamp(36px, 5vw, 48px);letter-spacing:-0.03em;margin:0;line-height:1.05">Stop applying into a black hole. <br class="hidden sm:block" /><span class="serif italic font-normal text-[var(--accent)]">Start landing interviews.</span></h2>
            <p style="color:var(--text-2);font-size:clamp(16px, 2vw, 18px);margin-top:18px;margin-bottom:32px;max-width:540px;margin-inline:auto">We built the ultimate engine to get you past the bots and in front of human gatekeepers. No paywalls, no BS. Just a resume that actually works.</p>
            <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap">
              <a href="/signup" class="btn btn-accent btn-lg font-bold" style="padding:0 32px">Build your resume now</a>
            </div>
          </div>
        </section>
      </main>

      <footer style="border-top:1px solid var(--border)">
        <div class="container" style="display:flex;align-items:center;gap:16px;padding:28px 24px;flex-wrap:wrap">
          ${buildBrandMarkup()}
          <span class="flex-1"></span>
          <span class="mono text-[12.5px] text-[var(--muted)]">ResuMe by Ayush · <a href="https://Ayuslh.in" target="_blank" rel="noreferrer" class="ulink text-[var(--text-2)]">Ayuslh.in</a></span>
        </div>
      </footer>
      <script>
        (function() {
          const btn = document.getElementById('static-theme-toggle');
          const sun = document.getElementById('theme-icon-sun');
          const moon = document.getElementById('theme-icon-moon');
          
          function applyTheme(isDark) {
            if (isDark) {
              document.documentElement.style.backgroundColor = '#0a0a0c';
              document.body.setAttribute('data-theme', 'dark');
              if (sun && moon) {
                sun.style.display = 'block';
                moon.style.display = 'none';
              }
              localStorage.setItem('app-theme', 'dark');
            } else {
              document.documentElement.style.backgroundColor = '#ffffff';
              document.body.removeAttribute('data-theme');
              if (sun && moon) {
                sun.style.display = 'none';
                moon.style.display = 'block';
              }
              localStorage.setItem('app-theme', 'light');
            }
          }

          if (btn) {
            btn.addEventListener('click', () => {
              const isDark = document.body.getAttribute('data-theme') === 'dark';
              applyTheme(!isDark);
            });
          }

          // Handle initial state set by root index.html or localStorage
          const savedTheme = localStorage.getItem('app-theme') || 'light';
          applyTheme(savedTheme === 'dark');
        })();
      </script>
    </div>
  `.trim()
}
