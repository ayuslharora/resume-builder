import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("PublicResume resolves resumes by share token", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /const \{ token \} = useParams\(\)/);
  assert.match(source, /getResumeByShareToken/);
});

test("PublicResume route is not nested under auth-gated fullscreen routes", async () => {
  const appSource = await readFile(new URL("../App.jsx", import.meta.url), "utf8");
  const publicRouteIndex = appSource.indexOf('{ path: "/shared/:token", element: <PublicResume /> }');
  const fullscreenRouteIndex = appSource.indexOf("element: <FullscreenProtectedRoute />");

  assert.notEqual(publicRouteIndex, -1);
  assert.notEqual(fullscreenRouteIndex, -1);
  assert.ok(publicRouteIndex < fullscreenRouteIndex);
});

test("PublicResume records one distinct viewer id for published resume views", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /recordResumeView/);
  assert.match(source, /getOrCreateResumeViewerId/);
  assert.match(source, /resumeId: data\.id/);
  assert.match(source, /ownerId: data\.userId/);
});

test("PublicResume uses the favicon for the shared app brand mark", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /className=\{`app-design min-h-screen pb-16 \$\{isDark \? "dark" : ""\}`\}/);
  assert.match(source, /src="\/favicon\.svg"/);
  assert.doesNotMatch(source, /FileText size=\{16\}/);
  assert.doesNotMatch(source, />\s*R\s*</);
});

test("PublicResume navbar follows the current app design tokens", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /shared-resume-navbar border-b border-\[var\(--border\)\]/);
  assert.match(source, /className="container shared-resume-nav-inner"/);
  assert.match(source, /Resu<span className="serif italic font-normal">Me<\/span>/);
  assert.match(source, /ResuMe by Ayush ·/);
  assert.doesNotMatch(source, /built with care/);
  assert.match(source, /Ayuslh\.in/);
  assert.match(source, /className="btn btn-accent btn-sm"/);
  assert.doesNotMatch(source, /rgba\(7,13,31,0\.8\)/);
  assert.doesNotMatch(source, /btn-primary py-1\.5 px-4 text-xs/);
});

test("PublicResume navbar includes the shared theme toggle", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /Sun,\s*Moon/);
  assert.match(source, /const \[theme, setTheme\]/);
  assert.match(source, /localStorage\.getItem\("app-theme"\)/);
  assert.match(source, /localStorage\.setItem\("app-theme", newTheme\)/);
  assert.match(source, /aria-label="Toggle theme"/);
  assert.match(source, /isDark \? <Sun size=\{16\} \/> : <Moon size=\{16\} \/>/);
});

test("PublicResume unavailable state follows the current app design tokens", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../index.css", import.meta.url), "utf8");

  assert.match(source, /className=\{`app-design shared-resume-error-shell \$\{isDark \? "dark" : ""\}`\}/);
  assert.match(source, /className="shared-resume-error-card panel"/);
  assert.match(source, /Resume unavailable/);
  assert.match(source, /className="btn btn-accent btn-sm"/);
  assert.doesNotMatch(source, /Access Denied/);
  assert.doesNotMatch(source, /rgba\(25,31,49,0\.5\)/);
  assert.doesNotMatch(source, /btn-primary inline-flex items-center gap-2/);
  assert.match(css, /\.app-design\.shared-resume-error-shell\s*\{/);
  assert.match(css, /\.app-design\.shared-resume-error-shell\s*\{[\s\S]*?align-items:\s*center/);
  assert.match(css, /\.app-design\.shared-resume-error-shell\s*\{[\s\S]*?justify-content:\s*center/);
  assert.doesNotMatch(css, /\.app-design \.shared-resume-error-shell\s*\{/);
  assert.match(css, /\.app-design \.shared-resume-error-card\s*\{/);
  assert.match(css, /\.app-design \.shared-resume-error-card\s*\{[\s\S]*?justify-items:\s*center/);
  assert.match(css, /\.app-design \.shared-resume-error-card\s*\{[\s\S]*?text-align:\s*center/);
});

test("PublicResume includes the compact shared credit", async () => {
  const source = await readFile(new URL("./PublicResume.jsx", import.meta.url), "utf8");

  assert.match(source, /ResuMe by Ayush/);
  assert.match(source, /href="https:\/\/Ayuslh\.in"/);
  assert.match(source, /target="_blank"/);
  assert.match(source, /rel="noreferrer"/);
});
