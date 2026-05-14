import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildHomepageStaticHtml } from "./homepageSeoContent.js";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tagWithAttributes(tagName, attributes) {
  const lookaheads = Object.entries(attributes).map(
    ([name, value]) => `(?=[^>]*\\b${escapeRegExp(name)}=["']${escapeRegExp(value)}["'])`
  );

  return new RegExp(`<${tagName}\\b${lookaheads.join("")}[^>]*>`, "i");
}

test("homepage HTML exposes production SEO metadata and structured data", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");

  assert.match(html, /<title>Free AI Resume Builder \| ResuMe<\/title>/);
  assert.match(
    html,
    tagWithAttributes("meta", {
      name: "description",
      content:
        "ResuMe is an open-access ATS-focused resume builder and grader for students, fresh graduates, and early-career professionals.",
    }),
  );
  assert.match(
    html,
    tagWithAttributes("link", { rel: "canonical", href: "https://resume.ayuslh.in/" })
  );
  assert.match(html, tagWithAttributes("meta", { name: "robots", content: "index, follow" }));
  assert.match(
    html,
    tagWithAttributes("meta", {
      property: "og:title",
      content: "Free AI Resume Builder | ResuMe",
    })
  );
  assert.match(
    html,
    tagWithAttributes("meta", { property: "og:url", content: "https://resume.ayuslh.in/" })
  );
  assert.match(
    html,
    tagWithAttributes("meta", { name: "twitter:card", content: "summary_large_image" })
  );
  assert.match(html, tagWithAttributes("script", { type: "application/ld+json" }));
  assert.match(html, /"@type"\s*:\s*"WebSite"/);
  assert.match(html, /"@type"\s*:\s*"WebPage"/);
  assert.match(html, /"@type"\s*:\s*"Person"/);
  assert.match(html, /"@type"\s*:\s*"SoftwareApplication"/);
  assert.match(html, /"@type"\s*:\s*"Organization"/);
  assert.match(html, /"@type"\s*:\s*"Offer"/);
  assert.match(html, /"datePublished"\s*:\s*"2026-05-03"/);
  assert.match(html, /"dateModified"\s*:\s*"2026-05-14"/);
  assert.match(html, /"price"\s*:\s*"0"/);
  assert.match(html, /"availability"\s*:\s*"https:\/\/schema\.org\/InStock"/);
  assert.match(html, /<!-- HOMEPAGE_SEO_SHELL -->/);
});

test("public crawl and AI discovery assets are present and point at the production site", async () => {
  const [robotsResult, sitemapResult, llmsResult] = await Promise.allSettled([
    readFile(new URL("../../public/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../../public/llms.txt", import.meta.url), "utf8"),
  ]);

  assert.equal(
    robotsResult.status,
    "fulfilled",
    robotsResult.status === "rejected"
      ? `Missing public/robots.txt: ${robotsResult.reason.code}`
      : undefined
  );
  assert.equal(
    sitemapResult.status,
    "fulfilled",
    sitemapResult.status === "rejected"
      ? `Missing public/sitemap.xml: ${sitemapResult.reason.code}`
      : undefined
  );
  assert.equal(
    llmsResult.status,
    "fulfilled",
    llmsResult.status === "rejected"
      ? `Missing public/llms.txt: ${llmsResult.reason.code}`
      : undefined
  );

  const robots = robotsResult.value;
  const sitemap = sitemapResult.value;
  const llms = llmsResult.value;

  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Content-Signal: search=yes,ai-input=yes,ai-train=no/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /User-agent: GPTBot\s+Allow: \//);
  assert.match(robots, /User-agent: OAI-SearchBot\s+Allow: \//);
  assert.match(robots, /User-agent: ChatGPT-User\s+Allow: \//);
  assert.match(robots, /User-agent: AnthropicBot\s+Allow: \//);
  assert.match(robots, /User-agent: PerplexityBot\s+Allow: \//);
  assert.match(robots, /User-agent: Google-Extended\s+Disallow: \//);
  assert.match(robots, /Sitemap: https:\/\/resume\.ayuslh\.in\/sitemap\.xml/);

  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/templates<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/grader-info<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/pricing<\/loc>/);
  assert.doesNotMatch(sitemap, /\/login/);
  assert.doesNotMatch(sitemap, /\/signup/);
  assert.doesNotMatch(sitemap, /\/dashboard/);
  assert.doesNotMatch(sitemap, /\/builder\//);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/grader<\/loc>/);

  assert.match(llms, /ResuMe/);
  assert.match(llms, /ATS/i);
  assert.match(llms, /free ATS-friendly resume builder and grader/i);
  assert.match(llms, /one workflow/i);
  assert.match(llms, /Limitations|limitations:/);
  assert.match(llms, /no subscriptions/i);
  assert.match(llms, /public pages are accessible without an account/i);
  assert.match(llms, /https:\/\/resume\.ayuslh\.in\//);
  assert.match(llms, /Founder\/creator: Ayush/);
  assert.match(llms, /## Main sections/);
  assert.match(llms, /\[Homepage\]\(https:\/\/resume\.ayuslh\.in\/\)/);
  assert.match(llms, /Professional/);
  assert.doesNotMatch(llms, /Classic, Modern, Minimal, and Creative/);
});

test("vercel routing avoids indexable homepage shells on non-home routes", async () => {
  const vercel = JSON.parse(await readFile(new URL("../../vercel.json", import.meta.url), "utf8"));
  const routes = vercel.routes ?? [];

  assert.ok(
    routes.some((route) => route.src === "/templates" && route.dest === "/templates.html"),
    "expected /templates to use a static route shell",
  );
  assert.ok(
    routes.some((route) => route.src === "/grader-info" && route.dest === "/grader-info.html"),
    "expected /grader-info to use a static route shell",
  );
  assert.ok(
    routes.some((route) => route.src === "/pricing" && route.dest === "/pricing.html"),
    "expected /pricing to use a static route shell",
  );
  assert.ok(
    routes.some((route) => route.src === "/login" && route.dest === "/login.html"),
    "expected /login to use a noindex auth shell",
  );
  assert.ok(
    routes.some((route) => route.src === "/(.*)" && route.dest === "/404.html" && route.status === 404),
    "expected unknown routes to return a 404 shell",
  );
  assert.ok(
    routes.some((route) => route.headers?.["Content-Security-Policy"] === "frame-ancestors 'none'"),
    "expected a frame-ancestor CSP hardening header",
  );
  assert.ok(
    routes.some((route) => route.headers?.["Cache-Control"] === "public, max-age=31536000, immutable"),
    "expected immutable caching for hashed assets",
  );
});

test("homepage schema keeps published and modified dates separate", async () => {
  const siteSeoSource = await readFile(new URL("./siteSeo.js", import.meta.url), "utf8");

  assert.match(siteSeoSource, /HOME_DATE_PUBLISHED\s*=\s*'2026-05-03'/);
  assert.match(siteSeoSource, /HOME_DATE_MODIFIED\s*=\s*'2026-05-14'/);
  assert.match(siteSeoSource, /datePublished:\s*HOME_DATE_PUBLISHED/);
  assert.match(siteSeoSource, /dateModified:\s*HOME_DATE_MODIFIED/);
  assert.doesNotMatch(siteSeoSource, /datePublished:\s*HOME_DATE_MODIFIED/);
});

test("static route generation reports file write failures clearly", async () => {
  const viteSource = await readFile(new URL("../../vite.config.js", import.meta.url), "utf8");

  assert.match(viteSource, /try\s*\{\s*await Promise\.all\(/);
  assert.match(viteSource, /catch\s*\(error\)/);
  assert.match(viteSource, /Failed to generate static route files/);
  assert.match(viteSource, /this\.error\(/);
});

test("homepage static shell contains the public answer blocks used for AI search", () => {
  const shell = buildHomepageStaticHtml();

  assert.match(shell, /id="homepage-static-shell"/);
  assert.match(shell, /What is ResuMe\?/);
  assert.match(shell, /How does the ATS grader work\?/);
  assert.match(shell, /Start Building Now/);
  assert.match(shell, /Grade My Resume/);
  assert.match(shell, /Trusted by candidates targeting roles at/);
  assert.match(shell, /landing-company-ticker/);
  assert.match(shell, /ResuMe by Ayush/);
  assert.doesNotMatch(shell, /built with care/);
  assert.match(shell, /Ayuslh\.in/);
});
