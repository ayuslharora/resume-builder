import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  APP_SHELL_SEO,
  PUBLIC_STATIC_ROUTES,
  buildAppShellHtml,
  buildStaticRouteHtml,
} from "./staticRouteHtml.js";

function tagWithAttributes(tagName, attributes) {
  const lookaheads = Object.entries(attributes).map(
    ([name, value]) => `(?=[^>]*\\b${name}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'])`,
  );

  return new RegExp(`<${tagName}\\b${lookaheads.join("")}[^>]*>`, "i");
}

test("public static routes expose unique raw SEO metadata", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const templateRoute = PUBLIC_STATIC_ROUTES.find((route) => route.path === "/templates");

  assert.ok(templateRoute);

  const routeHtml = buildStaticRouteHtml(html, templateRoute);

  assert.match(routeHtml, /<title>Resume Templates \| ResuMe<\/title>/);
  assert.match(
    routeHtml,
    tagWithAttributes("link", {
      rel: "canonical",
      href: "https://resume.ayuslh.in/templates",
    }),
  );
  assert.match(
    routeHtml,
    tagWithAttributes("meta", {
      property: "og:url",
      content: "https://resume.ayuslh.in/templates",
    }),
  );
  assert.match(routeHtml, />ATS-Friendly Resume Templates</);
  assert.match(routeHtml, /"@type"\s*:\s*"ItemList"/);
  assert.doesNotMatch(routeHtml, /<link rel="canonical" href="https:\/\/resume\.ayuslh\.in\/" \/>/);
  assert.doesNotMatch(routeHtml, />Unlimited AI Resume Builder with ATS grading\.</);
});

test("noindex app shell keeps protected and auth routes out of raw indexing", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  const routeHtml = buildAppShellHtml(html, {
    ...APP_SHELL_SEO,
    path: "/login",
    title: "Log in to ResuMe",
    description: "Log in to your ResuMe workspace.",
    canonical: "https://resume.ayuslh.in/login",
    robots: "noindex,follow",
  });

  assert.match(routeHtml, /<title>Log in to ResuMe<\/title>/);
  assert.match(routeHtml, tagWithAttributes("meta", { name: "robots", content: "noindex,follow" }));
  assert.match(
    routeHtml,
    tagWithAttributes("link", {
      rel: "canonical",
      href: "https://resume.ayuslh.in/login",
    }),
  );
  assert.doesNotMatch(routeHtml, /"@type"\s*:\s*"SoftwareApplication"/);
});
