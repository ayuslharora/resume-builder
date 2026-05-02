# Homepage SEO Foundation Design

## Goal

Improve the SEO and AI-discovery foundation for `https://resume.ayuslh.in` without changing the landing page layout or broadening the work into a full route-by-route SEO system.

## Scope

This pass will cover:

- Homepage metadata in `index.html`
- Homepage structured data
- Crawl/discovery assets in `public/`
- AI-readable site guidance via `llms.txt`

This pass will not cover:

- Dynamic route metadata for every page
- Large copy rewrites or new landing page sections
- Dedicated OG image design work
- Full technical SEO audit across the entire site

## Current State

The current homepage has a generic document title (`ResuMe`) and does not expose a clear meta description, canonical URL, Open Graph tags, Twitter tags, schema markup, sitemap, robots file, or `llms.txt`. The landing page content already communicates the core offer clearly: AI resume building, ATS-safe resumes, and a resume grader.

## Recommended Approach

Implement a focused SEO foundation pass that keeps the current product and UX intact while improving how search engines and AI systems understand the site.

### Metadata

Update `index.html` with:

- A descriptive title centered on resume builder and ATS intent
- A concise meta description aligned with the landing page offer
- Canonical URL pointing to `https://resume.ayuslh.in/`
- Robots meta tag allowing indexing
- Open Graph tags for title, description, URL, site name, type, and image
- Twitter card tags for title, description, and image

The metadata should target the homepage as a product landing page, not as a blog or generic portfolio site.

### Structured Data

Add JSON-LD to the homepage using:

- `WebSite`
- `SoftwareApplication`

The schema should describe ResumeForge as a web-based resume builder and resume grading tool, reference the production URL, and avoid unverifiable claims such as fabricated ratings or review counts.

### Crawl And Discovery Assets

Add the following files under `public/`:

- `robots.txt`
- `sitemap.xml`
- `llms.txt`

`robots.txt` should allow crawling and point to the sitemap.

`sitemap.xml` should include the canonical homepage URL and any other clearly public, index-worthy routes that do not require authentication. Auth-gated routes should be excluded.

`llms.txt` should be placed at the site root via `public/llms.txt`, using the emerging standard filename `llms.txt` rather than `llm.txt`.

## Public URL Inclusion Rules

Index only routes that are intentionally public and useful as landing or discovery pages. Based on the current router structure, likely candidates are:

- `/`
- `/login`
- `/signup`
- Public share route only if it is tokenized per-user content and not intended for discovery: exclude from sitemap
- Auth-gated app routes such as dashboard, resumes, builder, grader, export, and profile: exclude from sitemap

If a route is user-specific, gated, or low-value for search discovery, it should remain out of the sitemap.

## Content Positioning

The homepage metadata and schema should reinforce these themes:

- AI resume builder
- ATS-friendly or ATS-optimized resumes
- Resume grader
- Professional resume templates

The implementation should stay natural and avoid keyword stuffing. It should reflect the visible page content rather than introduce unsupported claims.

## OG Image Strategy

Use an existing suitable site asset for the initial `og:image` if one is already present and publicly servable. If no strong share image exists, still wire the metadata structure so a dedicated image can be dropped in later with minimal code changes.

This avoids blocking the SEO pass on design work while still improving social metadata structure.

## Error Handling And Safety

- Keep all URLs absolute where required by metadata and schema
- Avoid adding schema properties that cannot be verified from the product
- Exclude authenticated routes from discovery files
- Keep the implementation static and deployment-friendly for Vite

## Verification

After implementation:

- Build the app with `npm run build`
- Inspect the generated HTML and public asset outputs in `dist/`
- Confirm `robots.txt`, `sitemap.xml`, and `llms.txt` are emitted
- Confirm the metadata and JSON-LD are present in the built homepage

## Expected Outcome

This pass should improve:

- Search snippet quality
- Crawl discovery
- Social sharing previews
- AI system understanding of the site’s purpose and key public pages

It will not by itself guarantee ranking gains, but it will remove obvious foundational SEO gaps on the homepage.
