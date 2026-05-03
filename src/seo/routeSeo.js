import React from 'react'
import {
  HOME_DESCRIPTION,
  HOME_JSON_LD,
  HOME_TITLE,
  SITE_NAME,
  SOCIAL_IMAGE,
  SITE_URL,
} from './siteSeo.js'

function normalizePath(path = '/') {
  if (!path) return '/'
  return path.startsWith('/') ? path : `/${path}`
}

function buildUrl(path) {
  return new URL(normalizePath(path), SITE_URL).toString()
}

function formatTitle(title, siteName) {
  if (!title) return siteName
  if (title.includes(siteName)) return title
  return `${title} | ${siteName}`
}

function toJsonLdString(jsonLd) {
  if (!jsonLd?.length) return ''

  return JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@graph': jsonLd,
    },
    null,
    2,
  )
}

function readAttributes(node, names) {
  return names.reduce((snapshot, name) => {
    snapshot[name] = node.getAttribute(name)
    return snapshot
  }, {})
}

function restoreAttributes(node, snapshot) {
  for (const [name, value] of Object.entries(snapshot)) {
    if (value === null) {
      node.removeAttribute(name)
    } else {
      node.setAttribute(name, value)
    }
  }
}

function setElementAttributes(node, attributes) {
  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, value)
  }
}

function upsertSeoNode(document, selector, tagName, attributes, textContent) {
  const existing = document.querySelector(selector)
  const created = !existing
  const node = existing ?? document.createElement(tagName)
  const attributeNames = Object.keys(attributes)
  const snapshot = created ? null : readAttributes(node, attributeNames)
  const previousTextContent = created ? null : node.textContent

  if (created) {
    document.head.appendChild(node)
  }

  setElementAttributes(node, attributes)

  if (textContent !== undefined) {
    node.textContent = textContent
  }

  return () => {
    if (created) {
      node.parentNode?.removeChild(node)
      return
    }

    restoreAttributes(node, snapshot)
    if (textContent !== undefined) {
      node.textContent = previousTextContent ?? ''
    }
  }
}

export function buildRouteSeo(input = {}) {
  const {
    title = HOME_TITLE,
    description = HOME_DESCRIPTION,
    path = '/',
    canonical = buildUrl(path),
    robots = 'index, follow',
    siteName = SITE_NAME,
    image = SOCIAL_IMAGE,
    noIndex = false,
    jsonLd = [],
  } = input

  const resolvedRobots = noIndex ? 'noindex, nofollow' : robots
  const resolvedTitle = formatTitle(title, siteName)

  return {
    title: resolvedTitle,
    description,
    canonical,
    robots: resolvedRobots,
    openGraph: {
      type: 'website',
      siteName,
      title: resolvedTitle,
      description,
      url: canonical,
      image,
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      image,
    },
    jsonLd,
  }
}

export function applyRouteSeo(document, seo) {
  if (!document?.head) {
    return () => {}
  }

  const previousTitle = document.title
  document.title = seo.title

  const cleanups = [
    upsertSeoNode(
      document,
      'meta[name="description"]',
      'meta',
      { name: 'description', content: seo.description },
    ),
    upsertSeoNode(
      document,
      'meta[name="robots"]',
      'meta',
      { name: 'robots', content: seo.robots },
    ),
    upsertSeoNode(
      document,
      'link[rel="canonical"]',
      'link',
      { rel: 'canonical', href: seo.canonical },
    ),
    upsertSeoNode(
      document,
      'meta[property="og:type"]',
      'meta',
      { property: 'og:type', content: seo.openGraph.type },
    ),
    upsertSeoNode(
      document,
      'meta[property="og:site_name"]',
      'meta',
      { property: 'og:site_name', content: seo.openGraph.siteName },
    ),
    upsertSeoNode(
      document,
      'meta[property="og:title"]',
      'meta',
      { property: 'og:title', content: seo.openGraph.title },
    ),
    upsertSeoNode(
      document,
      'meta[property="og:description"]',
      'meta',
      { property: 'og:description', content: seo.openGraph.description },
    ),
    upsertSeoNode(
      document,
      'meta[property="og:url"]',
      'meta',
      { property: 'og:url', content: seo.openGraph.url },
    ),
    upsertSeoNode(
      document,
      'meta[property="og:image"]',
      'meta',
      { property: 'og:image', content: seo.openGraph.image },
    ),
    upsertSeoNode(
      document,
      'meta[name="twitter:card"]',
      'meta',
      { name: 'twitter:card', content: seo.twitter.card },
    ),
    upsertSeoNode(
      document,
      'meta[name="twitter:title"]',
      'meta',
      { name: 'twitter:title', content: seo.twitter.title },
    ),
    upsertSeoNode(
      document,
      'meta[name="twitter:description"]',
      'meta',
      { name: 'twitter:description', content: seo.twitter.description },
    ),
    upsertSeoNode(
      document,
      'meta[name="twitter:image"]',
      'meta',
      { name: 'twitter:image', content: seo.twitter.image },
    ),
    upsertSeoNode(
      document,
      'script[type="application/ld+json"]',
      'script',
      { type: 'application/ld+json' },
      toJsonLdString(seo.jsonLd),
    ),
  ]

  return () => {
    document.title = previousTitle
    for (const cleanup of cleanups.reverse()) {
      cleanup()
    }
  }
}

export function useRouteSeo(input = {}) {
  const {
    title,
    description,
    path,
    canonical,
    robots,
    siteName,
    image,
    noIndex,
    jsonLd = [],
  } = input
  const jsonLdKey = JSON.stringify(jsonLd)

  const seo = React.useMemo(
    () =>
      buildRouteSeo({
        title,
        description,
        path,
        canonical,
        robots,
        siteName,
        image,
        noIndex,
        jsonLd: JSON.parse(jsonLdKey),
      }),
    [title, description, path, canonical, robots, siteName, image, noIndex, jsonLdKey],
  )

  React.useLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return undefined
    }

    return applyRouteSeo(document, seo)
  }, [seo])

  return seo
}

export { HOME_DESCRIPTION, HOME_JSON_LD, HOME_TITLE, SITE_NAME, SOCIAL_IMAGE, SITE_URL }
