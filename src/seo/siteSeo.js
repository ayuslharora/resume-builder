export const SITE_NAME = 'ResuMe'
export const SITE_URL = 'https://resume.ayuslh.in/'
export const SOCIAL_IMAGE = `${SITE_URL}social-preview.png`

export const HOME_TITLE = 'Free AI Resume Builder | ResuMe'
export const HOME_DESCRIPTION =
  'Build ATS-friendly resumes, tailor job-ready content, and get free resume grading with ResuMe.'

export const HOME_JSON_LD = [
  {
    '@type': 'WebSite',
    '@id': `${SITE_URL}#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: HOME_DESCRIPTION,
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
  },
  {
    '@type': 'WebPage',
    '@id': `${SITE_URL}#webpage`,
    name: HOME_TITLE,
    url: SITE_URL,
    description: HOME_DESCRIPTION,
    isPartOf: {
      '@id': `${SITE_URL}#website`,
    },
    about: {
      '@id': `${SITE_URL}#softwareapplication`,
    },
  },
  {
    '@type': 'Organization',
    '@id': `${SITE_URL}#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}favicon.svg`,
    },
  },
  {
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}#softwareapplication`,
    name: SITE_NAME,
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'Resume Builder',
    operatingSystem: 'Web',
    url: SITE_URL,
    image: `${SITE_URL}favicon.svg`,
    description: HOME_DESCRIPTION,
    publisher: {
      '@id': `${SITE_URL}#organization`,
    },
    offers: {
      '@id': `${SITE_URL}#offer`,
    },
    featureList: [
      'ATS-friendly resume building',
      'AI-assisted content improvement',
      'Instant resume grading',
      'Free access with no subscription',
    ],
  },
  {
    '@type': 'Offer',
    '@id': `${SITE_URL}#offer`,
    url: SITE_URL,
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    category: 'Free access',
    itemOffered: {
      '@id': `${SITE_URL}#softwareapplication`,
    },
  },
]

export const AUTH_ROUTE_SEO = {
  '/login': {
    title: 'Log in to ResuMe',
    description: 'Log in to your ResuMe workspace.',
    robots: 'noindex,follow',
  },
  '/signup': {
    title: 'Create a ResuMe account',
    description: 'Create your ResuMe account and start building better resumes.',
    robots: 'noindex,follow',
  },
}
