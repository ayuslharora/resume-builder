import { HOME_TEMPLATE_PREVIEWS } from './homepageSeoContent.js'
import {
  AUTH_ROUTE_SEO,
  HOME_JSON_LD,
  HOME_TITLE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
} from './siteSeo.js'

const SHELL_START = '<!-- HOMEPAGE_SEO_SHELL_START -->'
const SHELL_END = '<!-- HOMEPAGE_SEO_SHELL_END -->'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function escapeAttribute(value) {
  return escapeHtml(value)
}

function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

function titleWithSite(title) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
}

function jsonLdScript(jsonLd = []) {
  return `<script type="application/ld+json">${JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': jsonLd,
    },
    null,
    2,
  ).replaceAll('<', '\\u003c')}</script>`
}

function routeWebPage(route, extra = {}) {
  return {
    '@type': 'WebPage',
    '@id': `${absoluteUrl(route.path)}#webpage`,
    name: route.title,
    url: absoluteUrl(route.path),
    description: route.description,
    isPartOf: {
      '@id': `${SITE_URL}#website`,
    },
    ...extra,
  }
}

function breadcrumbList(route) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(route.path)}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: route.breadcrumbName,
        item: absoluteUrl(route.path),
      },
    ],
  }
}

function templateItemList(route) {
  return {
    '@type': 'ItemList',
    '@id': `${absoluteUrl(route.path)}#templates`,
    name: 'ResuMe resume templates',
    itemListElement: HOME_TEMPLATE_PREVIEWS.map((template, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${template.name} resume template`,
      description: template.desc,
      url: `${absoluteUrl('/templates')}#${template.id}`,
      image: absoluteUrl(template.image),
    })),
  }
}

export const PUBLIC_STATIC_ROUTES = [
  {
    path: '/templates',
    fileName: 'templates.html',
    title: 'Resume Templates | ResuMe',
    description:
      'Browse ATS-friendly resume templates for ResuMe, including Minimal, Modern, Professional, and Creative layouts.',
    heading: 'ATS-Friendly Resume Templates',
    breadcrumbName: 'Templates',
    body: [
      'ResuMe includes four resume templates for structured, ATS-friendly applications: Minimal, Modern, Professional, and Creative.',
      'Each template is designed to keep resume sections readable for recruiters and applicant tracking systems while giving job seekers a clean starting point.',
    ],
    jsonLd(route) {
      return [
        HOME_JSON_LD[0],
        routeWebPage(route, {
          about: {
            '@id': `${absoluteUrl(route.path)}#templates`,
          },
        }),
        breadcrumbList(route),
        templateItemList(route),
      ]
    },
  },
  {
    path: '/grader-info',
    fileName: 'grader-info.html',
    title: 'ATS Resume Grader Features | ResuMe',
    description:
      "Discover how ResuMe's ATS grader reviews resume structure, keyword coverage, role alignment, and weak bullets.",
    heading: 'ATS Resume Grader',
    breadcrumbName: 'ATS Grader',
    body: [
      'The ResuMe ATS grader reviews a resume against a target role and highlights role alignment, keyword coverage, formatting safety, and structure.',
      'It turns resume feedback into specific next steps so job seekers can improve weak bullets and make the document easier for screening systems and recruiters to read.',
    ],
    jsonLd(route) {
      return [
        HOME_JSON_LD[0],
        routeWebPage(route, {
          about: {
            '@type': 'SoftwareApplication',
            name: 'ResuMe ATS grader',
            applicationCategory: 'BusinessApplication',
            applicationSubCategory: 'Resume Grader',
            operatingSystem: 'Web',
            url: absoluteUrl(route.path),
          },
        }),
        breadcrumbList(route),
      ]
    },
  },
  {
    path: '/pricing',
    fileName: 'pricing.html',
    title: 'Pricing | ResuMe',
    description:
      'ResuMe is free to start with resume building, ATS grading, templates, and export tools available without subscriptions.',
    heading: 'Free Resume Builder Pricing',
    breadcrumbName: 'Pricing',
    body: [
      'ResuMe offers resume building, ATS grading, templates, and export tools with no subscription requirement.',
      'The public pricing page explains the free access model and keeps private builder and export workflows behind account sign-in.',
    ],
    jsonLd(route) {
      return [
        HOME_JSON_LD[0],
        routeWebPage(route, {
          about: {
            '@id': `${absoluteUrl(route.path)}#free-plan`,
          },
        }),
        {
          '@type': 'Offer',
          '@id': `${absoluteUrl(route.path)}#free-plan`,
          name: 'ResuMe free access',
          price: '0',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: absoluteUrl(route.path),
          itemOffered: {
            '@id': `${SITE_URL}#softwareapplication`,
          },
        },
        breadcrumbList(route),
      ]
    },
  },
]

export const AUTH_STATIC_ROUTES = Object.entries(AUTH_ROUTE_SEO).map(([path, seo]) => ({
  path,
  fileName: `${path.slice(1)}.html`,
  title: seo.title,
  description: seo.description,
  canonical: absoluteUrl(path),
  robots: seo.robots,
}))

export const APP_SHELL_SEO = {
  path: '/app',
  title: 'ResuMe App',
  description: 'Open the ResuMe app workspace.',
  canonical: SITE_URL,
  robots: 'noindex,nofollow',
  jsonLd: [],
}

export const NOT_FOUND_SEO = {
  path: '/404',
  title: 'Page not found | ResuMe',
  description: 'This ResuMe page could not be found.',
  canonical: SITE_URL,
  robots: 'noindex,nofollow',
  jsonLd: [],
}

function replaceTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) {
    throw new Error(`Unable to find ${label} in HTML shell`)
  }

  return html.replace(pattern, replacement)
}

function replaceHeadSeo(html, route) {
  const title = titleWithSite(route.title)
  const canonical = route.canonical ?? absoluteUrl(route.path)
  const robots = route.robots ?? 'index, follow'
  const jsonLd = typeof route.jsonLd === 'function' ? route.jsonLd(route) : route.jsonLd ?? []

  let output = html
  output = replaceTag(output, /<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`, 'title')
  output = replaceTag(
    output,
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${escapeAttribute(route.description)}" />`,
    'meta description',
  )
  output = replaceTag(
    output,
    /<meta\s+name=["']robots["'][^>]*>/i,
    `<meta name="robots" content="${escapeAttribute(robots)}" />`,
    'meta robots',
  )
  output = replaceTag(
    output,
    /<link\s+rel=["']canonical["'][^>]*>/i,
    `<link rel="canonical" href="${escapeAttribute(canonical)}" />`,
    'canonical',
  )
  output = replaceTag(
    output,
    /<meta\s+property=["']og:title["'][^>]*>/i,
    `<meta property="og:title" content="${escapeAttribute(title)}" />`,
    'og:title',
  )
  output = replaceTag(
    output,
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${escapeAttribute(route.description)}" />`,
    'og:description',
  )
  output = replaceTag(
    output,
    /<meta\s+property=["']og:url["'][^>]*>/i,
    `<meta property="og:url" content="${escapeAttribute(canonical)}" />`,
    'og:url',
  )
  output = replaceTag(
    output,
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${escapeAttribute(route.image ?? SOCIAL_IMAGE)}" />`,
    'og:image',
  )
  output = replaceTag(
    output,
    /<meta\s+name=["']twitter:title["'][^>]*>/i,
    `<meta name="twitter:title" content="${escapeAttribute(title)}" />`,
    'twitter:title',
  )
  output = replaceTag(
    output,
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${escapeAttribute(route.description)}" />`,
    'twitter:description',
  )
  output = replaceTag(
    output,
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    `<meta name="twitter:image" content="${escapeAttribute(route.image ?? SOCIAL_IMAGE)}" />`,
    'twitter:image',
  )
  output = replaceTag(
    output,
    /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i,
    jsonLdScript(jsonLd),
    'JSON-LD',
  )

  return output
}

function replaceStaticShell(html, shell) {
  if (html.includes('<!-- HOMEPAGE_SEO_SHELL -->')) {
    return html.replace('<!-- HOMEPAGE_SEO_SHELL -->', shell)
  }

  const markerPattern = new RegExp(`${SHELL_START}[\\s\\S]*?${SHELL_END}`)
  if (markerPattern.test(html)) {
    return html.replace(markerPattern, `${SHELL_START}\n  ${shell}\n  ${SHELL_END}`)
  }

  throw new Error('Unable to find homepage SEO shell markers')
}

function buildRouteShell(route) {
  return `
    <div id="homepage-static-shell" class="app-design min-h-screen bg-[var(--bg)]" data-static-route="${escapeAttribute(route.path)}">
      <main class="container" style="padding-top:88px;padding-bottom:96px">
        <nav aria-label="Breadcrumb">
          <a href="/">ResuMe</a> / <span>${escapeHtml(route.breadcrumbName)}</span>
        </nav>
        <h1>${escapeHtml(route.heading)}</h1>
        ${route.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n        ')}
      </main>
    </div>
  `.trim()
}

function buildEmptyAppShell() {
  return '<div id="homepage-static-shell" data-noindex-shell="true"></div>'
}

export function buildStaticRouteHtml(html, route) {
  return replaceStaticShell(replaceHeadSeo(html, route), buildRouteShell(route))
}

export function buildAppShellHtml(html, route = APP_SHELL_SEO) {
  return replaceStaticShell(replaceHeadSeo(html, route), buildEmptyAppShell())
}

