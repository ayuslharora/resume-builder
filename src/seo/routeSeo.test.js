import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { applyRouteSeo, buildRouteSeo } from './routeSeo.js';
import { HOME_DESCRIPTION, HOME_TITLE } from './siteSeo.js';

function createElementStub(tagName) {
  return {
    tagName: tagName.toUpperCase(),
    nodeName: tagName.toUpperCase(),
    attributes: new Map(),
    children: [],
    parentNode: null,
    textContent: '',
    ownerDocument: null,
    setAttribute(name, value) {
      this.attributes.set(name, String(value));
    },
    getAttribute(name) {
      return this.attributes.has(name) ? this.attributes.get(name) : null;
    },
    removeAttribute(name) {
      this.attributes.delete(name);
    },
    appendChild(node) {
      node.parentNode = this;
      this.children.push(node);
      return node;
    },
    removeChild(node) {
      const index = this.children.indexOf(node);
      if (index !== -1) {
        this.children.splice(index, 1);
        node.parentNode = null;
      }
      return node;
    },
  };
}

function createDocumentStub() {
  const head = createElementStub('head');
  const body = createElementStub('body');
  const documentElement = createElementStub('html');
  const titleState = { value: '' };

  const document = {
    head,
    body,
    documentElement,
    titleState,
    nodeType: 9,
    title: '',
    addEventListener() {},
    removeEventListener() {},
    createElement(tagName) {
      const element = createElementStub(tagName);
      element.ownerDocument = document;
      return element;
    },
    querySelector(selector) {
      const match = selector.match(/^(meta|link|script)(?:\[([^=]+)=["']([^"']+)["']\])?(?:\[([^=]+)=["']([^"']+)["']\])?$/);
      const nodes = [...head.children, ...body.children];
      if (!match) return null;

      return nodes.find((node) => {
        if (node.tagName.toLowerCase() !== match[1]) return false;

        const pairs = [
          match[2] ? [match[2], match[3]] : null,
          match[4] ? [match[4], match[5]] : null,
        ].filter(Boolean);

        return pairs.every(([name, value]) => node.getAttribute(name) === value);
      }) || null;
    },
    querySelectorAll(selector) {
      const first = this.querySelector(selector);
      return first ? [first] : [];
    },
  };

  head.ownerDocument = document;
  body.ownerDocument = document;
  documentElement.ownerDocument = document;

  Object.defineProperty(document, 'title', {
    get() {
      return titleState.value;
    },
    set(value) {
      titleState.value = String(value);
    },
  });

  return document;
}

test('buildRouteSeo normalizes route metadata', () => {
  const seo = buildRouteSeo({
    title: 'Grader',
    description: 'ATS scoring for uploaded resumes.',
    path: '/grader',
    jsonLd: [
      {
        '@type': 'SoftwareApplication',
        name: 'ResuMe',
      },
    ],
  });

  assert.equal(seo.title, 'Grader | ResuMe');
  assert.equal(seo.description, 'ATS scoring for uploaded resumes.');
  assert.equal(seo.canonical, 'https://resume.ayuslh.in/grader');
  assert.equal(seo.robots, 'index, follow');
  assert.equal(seo.openGraph.url, 'https://resume.ayuslh.in/grader');
  assert.equal(seo.twitter.card, 'summary_large_image');
  assert.equal(seo.jsonLd.length, 1);
});

test('buildRouteSeo normalizes homepage metadata', () => {
  const seo = buildRouteSeo({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: '/',
    jsonLd: [
      {
        '@type': 'WebSite',
        name: 'ResuMe',
      },
      {
        '@type': 'SoftwareApplication',
        name: 'ResuMe',
      },
    ],
  });

  assert.equal(seo.title, 'Free AI Resume Builder | ResuMe');
  assert.equal(seo.description, HOME_DESCRIPTION);
  assert.equal(seo.canonical, 'https://resume.ayuslh.in/');
  assert.equal(seo.robots, 'index, follow');
  assert.equal(seo.jsonLd.length, 2);
});

test('buildRouteSeo normalizes login metadata', () => {
  const seo = buildRouteSeo({
    title: 'Log In',
    description: 'Log in to your ResuMe workspace.',
    path: '/login',
    robots: 'noindex,follow',
  });

  assert.equal(seo.title, 'Log In | ResuMe');
  assert.equal(seo.canonical, 'https://resume.ayuslh.in/login');
  assert.equal(seo.robots, 'noindex,follow');
});

test('buildRouteSeo normalizes signup metadata', () => {
  const seo = buildRouteSeo({
    title: 'Sign Up',
    description: 'Create your ResuMe account and start building better resumes.',
    path: '/signup',
    robots: 'noindex,follow',
  });

  assert.equal(seo.title, 'Sign Up | ResuMe');
  assert.equal(seo.canonical, 'https://resume.ayuslh.in/signup');
  assert.equal(seo.robots, 'noindex,follow');
});

test('applyRouteSeo updates the document head and restores it on cleanup', () => {
  const document = createDocumentStub();
  document.title = 'Old title';

  const existingDescription = document.createElement('meta');
  existingDescription.setAttribute('name', 'description');
  existingDescription.setAttribute('content', 'Old description');
  document.head.appendChild(existingDescription);

  const seo = buildRouteSeo({
    title: 'Profile',
    description: 'Manage your resume profile.',
    path: '/profile',
    jsonLd: [{ '@type': 'WebPage', name: 'ResuMe' }],
  });

  const cleanup = applyRouteSeo(document, seo);

  assert.equal(document.title, 'Profile | ResuMe');
  assert.equal(document.head.children.find((node) => node.getAttribute('name') === 'description').getAttribute('content'), 'Manage your resume profile.');
  assert.equal(document.head.children.find((node) => node.getAttribute('rel') === 'canonical').getAttribute('href'), 'https://resume.ayuslh.in/profile');
  assert.equal(document.head.children.find((node) => node.tagName === 'SCRIPT').textContent.includes('"@type"'), true);

  cleanup();

  assert.equal(document.title, 'Old title');
  assert.equal(document.head.children.find((node) => node.getAttribute('name') === 'description').getAttribute('content'), 'Old description');
  assert.equal(document.head.children.some((node) => node.getAttribute('rel') === 'canonical'), false);
  assert.equal(document.head.children.some((node) => node.tagName === 'SCRIPT'), false);
});

test('useRouteSeo is exported and wired to the DOM applier', async () => {
  const source = await readFile(new URL('./routeSeo.js', import.meta.url), 'utf8');

  assert.match(source, /export function useRouteSeo\(/);
  assert.match(source, /React\.useLayoutEffect\(/);
  assert.match(source, /return applyRouteSeo\(document, seo\)/);
});

test('siteSeo includes creator and freshness schema signals', async () => {
  const source = await readFile(new URL('./siteSeo.js', import.meta.url), 'utf8');

  assert.match(source, /'@type': 'Person'/);
  assert.match(source, /founder:/);
  assert.match(source, /sameAs:/);
  assert.match(source, /datePublished: HOME_LAST_MODIFIED/);
  assert.match(source, /dateModified: HOME_LAST_MODIFIED/);
});
