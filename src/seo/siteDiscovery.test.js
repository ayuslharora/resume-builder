import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("homepage HTML exposes production SEO metadata and structured data", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");

  assert.match(html, /<title>AI Resume Builder \| ResumeForge<\/title>/);
  assert.match(
    html,
    /<meta name="description" content="Build ATS-friendly resumes, tailor job-ready content, and get instant resume grading with ResumeForge\." \/>/,
  );
  assert.match(html, /<link rel="canonical" href="https:\/\/resume\.ayuslh\.in\/" \/>/);
  assert.match(html, /<meta name="robots" content="index, follow" \/>/);
  assert.match(html, /<meta property="og:title" content="AI Resume Builder \| ResumeForge" \/>/);
  assert.match(html, /<meta property="og:url" content="https:\/\/resume\.ayuslh\.in\/" \/>/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
  assert.match(html, /<script type="application\/ld\+json">/);
  assert.match(html, /"@type":"WebSite"/);
  assert.match(html, /"@type":"SoftwareApplication"/);
});

test("public crawl and AI discovery assets are present and point at the production site", async () => {
  const [robots, sitemap, llms] = await Promise.all([
    readFile(new URL("../../public/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../../public/sitemap.xml", import.meta.url), "utf8"),
    readFile(new URL("../../public/llms.txt", import.meta.url), "utf8"),
  ]);

  assert.match(robots, /User-agent: \*/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/resume\.ayuslh\.in\/sitemap\.xml/);

  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/login<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/resume\.ayuslh\.in\/signup<\/loc>/);
  assert.doesNotMatch(sitemap, /\/dashboard/);
  assert.doesNotMatch(sitemap, /\/builder\//);
  assert.doesNotMatch(sitemap, /\/grader/);

  assert.match(llms, /# ResumeForge/);
  assert.match(llms, /https:\/\/resume\.ayuslh\.in\//);
  assert.match(llms, /AI resume builder/);
  assert.match(llms, /ATS-friendly resumes/);
});
