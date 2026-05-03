import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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
        "Build ATS-friendly resumes, tailor job-ready content, and get free resume grading with ResuMe.",
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
  assert.match(html, /"@type"\s*:\s*"SoftwareApplication"/);
  assert.match(html, /"@type"\s*:\s*"Organization"/);
  assert.match(html, /"@type"\s*:\s*"Offer"/);
  assert.match(html, /"price"\s*:\s*"0"/);
  assert.match(html, /"availability"\s*:\s*"https:\/\/schema\.org\/InStock"/);
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
  assert.match(robots, /User-agent: GPTBot\s+Disallow: \//);
  assert.match(robots, /User-agent: OAI-SearchBot\s+Allow: \//);
  assert.match(robots, /User-agent: ClaudeBot\s+Disallow: \//);
  assert.match(robots, /User-agent: Google-Extended\s+Disallow: \//);
  assert.match(robots, /Sitemap: https:\/\/resume\.ayuslh\.in\/sitemap\.xml/);

  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/<\/loc>/);
  assert.doesNotMatch(sitemap, /\/login/);
  assert.doesNotMatch(sitemap, /\/signup/);
  assert.doesNotMatch(sitemap, /\/dashboard/);
  assert.doesNotMatch(sitemap, /\/builder\//);
  assert.doesNotMatch(sitemap, /\/grader/);

  assert.match(llms, /ResuMe/);
  assert.match(llms, /ATS/i);
  assert.match(llms, /free ATS-friendly resume builder and grader/i);
  assert.match(llms, /one workflow/i);
  assert.match(llms, /Limitations|limitations:/);
  assert.match(llms, /no subscriptions/i);
  assert.match(llms, /public pages are accessible without an account/i);
  assert.match(llms, /https:\/\/resume\.ayuslh\.in\//);
});
