---
id: 2026-11-14-astro-migration-phase-1
status: published
pr: https://github.com/molayab/molayab.github.io/pull/46
owner: webpage-designer
approved_by: human
approved_on: 2026-11-14
---
# Astro migration, phase 1 (like-for-like)

## Goal
Move molayab.com from Jekyll on GitHub Pages to Astro deployed by GitHub Actions, with no visible change: same content, same URLs, same green palette, same layout. The site adopts `design-template-kit` for its token layer and shared chrome, with the site's own brand in a theme file in this repo. It worked if: (a) a pixel comparison of `/`, `/blog/`, one post with code, one with mermaid, one with `{% raw %}` and `/404.html` shows no meaningful difference in both themes at 1440px and 390px; (b) every "must exist after any build" path exists; (c) grove-website's `blog.js` still parses `/feed.xml`; (d) Grove's `release-blogger` can still open a post PR unchanged.

The teal-green tint is phase 2 and is not planned here. No colors change.

## Scope
- In: Astro project scaffold; homepage and blog ported 1:1; content collection over `_posts/`; Atom feed; sitemap; mermaid; code highlighting; Liquid-compat for existing posts; kit adoption with a site theme; GitHub Actions deploy; AGENTS.md updates; a component audit (kit vs site).
- Out: any color, spacing, type, copy or layout change; teal tint; new pages; new features (search, comments, i18n); changing `index.html` content; changing post content (except as listed under "Existing posts"); a Pages registry; legal pages.

## Design concepts used
- The current palette and tokens (see `docs/design/design-system.md`, "Color tokens"), reproduced exactly.
- Kit v0.1.1 theming API: primitives (`--brand`, `--font`, radii, neutral palettes) plus derived semantic tokens. Kit semantic tokens are derived with `color-mix()` and the kit's default is dark; the site's existing values are fixed hex values and the default is light with an OS dark override. Because the theme loads after the kit, the site theme must set the semantic tokens explicitly (not just the primitives) so no computed value changes. This is the main fidelity risk of the migration.
- New concept, justified: a Shiki code theme whose token colors reproduce the current Rouge palette in `post.css`, switched by `data-theme` and `prefers-color-scheme` through CSS variables (needed because the site has a manual toggle, which Shiki's default `prefers-color-scheme` dual-theme mode does not follow).

## Changes

### 1. Project structure (Where: repo root, not visual)
- Astro static output (`output: 'static'`), `site: https://molayab.com`, `trailingSlash: 'always'`, `build.format: 'directory'` so URLs and canonical tags match today's.
- `src/pages/index.astro` (homepage), `src/pages/blog/index.astro`, `src/pages/blog/[year]/[month]/[day]/[slug]/index.astro` (post), `src/pages/404.astro`, `src/pages/feed.xml.ts`.
- `src/layouts/Base.astro` (replaces `_layouts/default.html`; head/meta/analytics/theme toggle/footer), `src/layouts/Post.astro`.
- `src/components/` for site components (see audit). `src/styles/theme.css` (brand), `src/styles/site.css`, `src/styles/post.css` (ported verbatim, de-duplicated against the kit).
- `public/` holds `CNAME`, `robots.txt`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `og-image.png` and `assets/images/posts/*.png` at the same URLs. Post covers stay at `assets/images/posts/<slug>.png` so Grove's contract and every `image:` value keep working.
- The homepage's inline `<style>` and `<script>` move into the Astro layer; the "single self-contained file, no build step" rule is retired by this phase (AGENTS.md updated, see below). Analytics tags, JSON-LD `WebSite` + `Person` graph, `og:*`/`twitter:*` and `#themeColorMeta` behaviour are preserved byte-for-byte in content.

### 2. Blog content (Where: `_posts/`, collection)
- Collection reads `_posts/*.md` in place (glob loader). Do not move the folder: Grove's release flow writes there.
- Front matter schema: `layout` (accepted and ignored), `title`, `description`, `date`, `tags`, `image`, optional `image_alt`, optional `last_modified_at`. `date` strings like `2026-08-01 12:00:00 -0000` must parse; the coder verifies for all 25 existing posts.
- URL from the filename, not the front matter: `YYYY-MM-DD-slug.md` becomes `/blog/YYYY/MM/DD/slug/` (month and day zero-padded, as today).
- `future: true` equivalent: no date filtering, posts dated ahead of build time still publish. State this in the code as a comment so it is not "fixed" later.
- Sort newest first. Reading time keeps today's formula (words / 200, minimum 1).
- Listing page keeps the tag filter bar with counts and the same behaviour (buttons, `aria-pressed`, "All"); posts without `image:` still render without a broken slot.

### 3. Existing posts that use Liquid (Where: `_posts/`)
Inventory: 4 posts use `{% raw %}`/`{% endraw %}` (grove-0-7-0 and others contain `{{branch}}`-style text), and 5 use `{% post_url <slug> %}` for cross-links. Astro will print these literally unless handled. Decision for phase 1: do not rewrite post files; add a remark plugin that (a) removes `{% raw %}`/`{% endraw %}` markers, leaving their content verbatim, including `{{...}}` inside inline code and text; and (b) resolves `{% post_url YYYY-MM-DD-slug %}` to the post's `/blog/YYYY/MM/DD/slug/` path, failing the build if the target post does not exist. This keeps old posts and future posts written by Jekyll-trained agents working. Rendered text of every post must be unchanged. See open question 1 about later cleanup.

### 4. Syntax highlighting and mermaid
- Fenced code: highlighted with Shiki using a custom light and dark theme that reproduces today's Rouge colors from `post.css` (the coder derives the mapping from the existing `.highlight .k/.s/.nf/...` rules and compares rendered output against the live site). Code block chrome (background `--surface-2`, border, radius, horizontal scroll, inline code style) is unchanged. Language labels, if shown today, stay.
- Theme switching follows `data-theme` and the OS preference exactly like the page.
- Fenced `mermaid` blocks are excluded from Shiki and emitted as `<pre><code class="language-mermaid">`. The existing client script moves over unchanged in behaviour: load mermaid from `cdn.jsdelivr.net` only on pages that contain a mermaid block, replace blocks with `.mermaid` divs, render with `dark` or `default` mermaid theme, re-render when the toggle is used. The no-JS fallback styling stays. States to check: no-JS (styled raw block), theme toggle after render, reduced motion.

### 5. Feed and sitemap (Where: `/feed.xml`, `/sitemap.xml`)
- `/feed.xml` must be Atom (`http://www.w3.org/2005/Atom` namespace), not RSS 2.0. `@astrojs/rss` emits RSS, so the endpoint is a small custom Atom generator. Each `entry`: `title`, `link rel="alternate"` with an absolute `href` equal to the post canonical URL, `id` equal to that same absolute URL (as jekyll-feed does today, so subscribers do not see duplicates), `published`, `updated` (`last_modified_at` else date), `summary` and `content`, and one `category term="<tag>"` per tag. Feed-level `title`, `link rel="self"` and `link rel="alternate"`, `updated`, `id`, `author`. Entry count: same as today's jekyll-feed (10). Verify against `grove-website/src/scripts/blog.js`: it filters on the `grove` category, so all Grove release posts in the window must still carry that category.
- The feed must be served with `Access-Control-Allow-Origin: *` (GitHub Pages does this for static files, also under Actions-based deploy; verify with a header check after first deploy).
- The head `<link rel="alternate" ... href="/feed.xml">` changes its type to `application/atom+xml` (human decision, Q6). Nothing else in it changes.
- `/sitemap.xml` via `@astrojs/sitemap`: includes `/`, `/blog/`, all posts; excludes `/404.html`. Today jekyll-sitemap emits `/sitemap.xml` as a single file; `@astrojs/sitemap` emits `sitemap-index.xml` plus `sitemap-0.xml`. The coder must either post-process or add a custom endpoint so a flat `/sitemap.xml` exists (the Pipeline profile and `robots.txt` require it).
- `/404.html` must be a file at that exact path (Astro `404.astro` with `build.format: 'directory'` emits `404.html`; verify), with `noindex`.

### 6. Visual pages
Homepage, blog listing, post pages and 404 are rebuilt with identical markup classes, hierarchy, content, hover/focus/reduced-motion behaviour, responsive breakpoints (480px repo grid and project-card compaction, post-row stacking) and both themes. Copy: unchanged (English only). Assets: unchanged. Hardcoded repo stars and descriptions stay hardcoded.

## Component audit: kit vs site
Rule used: a component goes to the kit only if it is brand-neutral, free of site-specific content, and plausibly reusable by a second site (grove-website is the other consumer). Everything else stays in the site layer.

| Component | Decision | Reason |
|---|---|---|
| Theme toggle | Kit (already there: `src/theme-toggle.css`, in `core.css`). Consume it. Site adds only its own position/size override. | Generic, same markup as grove-website. Differences today: site toggle is `position: fixed; top/right 20px`, 36px, 10px radius, `--surface` background, icon rotation on hover; kit toggle is 34px, 8px radius, transparent, inline in nav. Keep the site look via a small override in the site layer. Optional kit change: add a `--theme-toggle-size` variable and an opt-in `.theme-toggle--floating` variant (see Kit change). The toggle script (set `data-theme`, persist `molayab-theme`, update `#themeColorMeta`) stays site-side because of the storage key and theme-color values. |
| Avatar with monogram fallback | Site | Contains the brand gradient, the "M" mark and a hotlinked GitHub URL. The fallback pattern (never `display:none` by default) is documented in AGENTS.md. Kit may later offer a generic "avatar with fallback" if grove-website needs one; not now. |
| Tag pill (`.tag`) | Site, built as a single component | Currently duplicated in `index.html` and `post.css`. Consolidate into one `Tag.astro` using semantic tokens only. It is small and style-specific. Reconsider for the kit only if a second site needs tags. |
| project-card (app card) | Site | Holds app-icon SVG pattern and Grove-specific content; layout (icon + text + link) is bespoke. Not generic enough. |
| repo-card (+ repo-grid) | Site, flagged as the best future kit candidate | Brand-neutral and reusable (name, description, meta row), but only this site uses it and the data is hardcoded. Promote once a second consumer exists, via a separate kit release. |
| post-card / post-feature / post-row / post-list / tag-filter | Site | Content-model specific (cover, date, reading time, tags); depends on the Jekyll-compatible front matter. |
| Footer | Site | Differs from kit footer (680px column, social links, Blog vs RSS swap). The kit's `footer { }` element selector and `.footer-inner` (980px) would change the layout; do not import it. Single `Footer.astro` with a prop for the Blog/RSS swap removes the current duplicate copy. |
| Tokens (primitives and semantic) | Kit consumes; brand values in site `theme.css` | See below. |
| Prose, nav, cookie banner, lightbox | Not used in phase 1 | `core.css` includes them; they must not leak into the site. |

Import strategy: do not import `core.css` or `foundation.css` (their reset, base typography, `footer`, `.section` and nav rules would change layout and font sizes). Import `design-template-kit/tokens.css` and `design-template-kit/src/theme-toggle.css` (both exposed by the kit's `exports`: `./tokens.css` and `./src/*`), then the site's `theme.css`, then `site.css` and `post.css`. If any imported kit partial changes a computed style versus today, the site layer overrides it; the visual comparison in the acceptance criteria is the arbiter.

## Design-system changes

Site theme (new file `src/styles/theme.css`, status TODO for the coder, values are specified here and are identical to today):
- Primitives: `--font` and `--mono` as today; `--radius: 20px`, `--radius-sm: 12px`, `--radius-pill: 980px`; `--brand: #1A7A4A` (the light accent), `--brand-hover` equal to `--brand` darkened to a value the coder proposes only if the kit requires it and no current surface uses it (the site has no kit buttons in phase 1); `--brand-contrast: #FFFFFF` (white on #1A7A4A is 5.35:1, passes); `--brand-on-dark: #52B788` (8.49:1 on black); `--brand-on-light: #1A7A4A` (4.90:1 on #F6F5F0).
- Neutral primitives: `--dark-bg: #000000`, `--dark-raised: #1E1E1B`, `--dark-section: #242420`, `--dark-text: #F5F3ED`; `--light-bg: #F6F5F0`, `--light-raised: #FFFFFF`, `--light-section: #EEECE5`, `--light-text: #211F1A`.
- Semantic overrides (needed because the kit derives these with `color-mix()`, which would not reproduce today's values): `--text-2`, `--text-3`, `--border`, `--accent`, `--accent-text` in each theme, set to the exact values in the design-system table. Site-only tokens `--surface`, `--surface-2`, `--glow`, `--ambient`, `--shadow-hover` are defined in `theme.css` per theme (kit does not know them). `--bg-raised` maps to `--surface`, `--bg-section` to `--surface-2` so kit components, if later used, stay consistent.
- Theme selection must match today: light when no preference, dark under `prefers-color-scheme: dark`, with `data-theme="dark"|"light"` overriding both. The kit's default is dark, so `theme.css` must restore the light default and the media query for the no-attribute case, and the inline early script must set `data-theme` before paint to avoid a flash (the existing `apply()` logic stays).
- Verified contrast: no new text/background pairs are introduced; all pairs are those in the design-system doc. Existing failure noted: `--text-3` is 2.27:1 (dark) and 2.20:1 (light), so it is decorative-only; phase 1 does not change it. Flagged for phase 2.

Kit change (separate, done in `molayab/design-template-kit` first, then a new tag, then bump here; optional, the migration can ship without it by using a site-side override):
- Add an opt-in floating variant of the theme toggle and size variable. TODO. If done: new tag (suggested v0.1.2), `package.json` and the tarball URL in this repo bump to it, grove-website not affected (opt-in).
- Pinned install for this repo: `design-template-kit` from the GitHub tag tarball `https://github.com/molayab/design-template-kit/archive/refs/tags/v0.1.1.tar.gz` (latest as of today), lockfile committed.

Doc edits already made: `docs/design/design-system.md` created (documents current state, contrast table). DONE.

## Deploy and repository settings (GitHub Actions)
- Workflow builds on push to `master` (and on pull requests as a build-only check), using `withastro/action` or checkout, Node LTS, `npm ci`, `astro build`, then `actions/upload-pages-artifact` and `actions/deploy-pages` with `pages: write` and `id-token: write`. `.nojekyll` is unnecessary, but harmless in `public/`.
- Manual steps for the human, in order: (1) merge only after the workflow passes on the PR; (2) Repo Settings > Pages > Build and deployment > Source: change from "Deploy from a branch" to "GitHub Actions"; (3) confirm the custom domain `molayab.com` and "Enforce HTTPS" are still set after the switch (the `CNAME` file in `public/` is carried in the artifact); (4) after the first deploy, check `/feed.xml` CORS header, `/sitemap.xml`, `/404.html` and a post URL; (5) if the `github-pages` environment has branch protection rules, allow `master`.
- Rollback: switch the Pages source back to "Deploy from a branch" (the Jekyll files remain in git history, so keep Jekyll removal in a separate commit from the Astro addition).
- Jekyll files removed in the same change: `_layouts/`, `_includes/`, `Gemfile`, `Gemfile.lock`, `_config.yml`, `blog/index.html`, `404.html` (replaced), root `index.html` (replaced). `_posts/` stays.

## Grove release-blogger contract
Unchanged paths and format: `_posts/YYYY-MM-DD-<slug>.md`, front matter `layout`, `title`, `description`, `date`, `tags`, `image`, plus `assets/images/posts/<slug>.png`. The schema accepts and ignores `layout`. The Astro build serves `assets/images/posts/*.png` from `public/`, so the physical PNG location the agent writes to must be `public/assets/images/posts/<slug>.png`, which is a changed path. Two ways to keep the contract with no change in `molayab/grove`: (a) keep the PNGs at the repo-root `assets/images/posts/` and have the build copy that folder to `dist/assets/images/posts/` (small integration or script), or (b) update `release-blogger.md` in `molayab/grove` to write into `public/`. This plan chooses (a) so no change to `molayab/grove` is required. `release-blogger` also reads `AGENTS.md`, `.agents/blog-writer.md` and `.agents/cover-image.md` and "checks the default branch": all stay. If it runs `bundle exec jekyll build` or mentions Jekyll/`{% raw %}` in its own instructions, that wording should be updated in `molayab/grove` in the same change (the coder checks `.claude/agents/release-blogger.md` and reports). The same copy approach is applied to root-level favicons and `og-image.png`: they may stay at repo root and be copied, or move to `public/`; either keeps the URLs.

## AGENTS.md sections to update after migration
- **Pipeline profile**: Default branch/deploy (Actions, not Jekyll-from-branch); Build (`npm ci && npm run build`, output `dist/`, same required paths); Vendored/non-registry dependencies (design-template-kit tarball, pinned tag); Feeds (now generated by the custom Atom endpoint); External content origins (unchanged); Locales unchanged.
- **What this repo is**: remove "single hand-authored static HTML page, no build step", the empty front matter paragraph and the `layout:` warning; describe Astro structure.
- **Development workflow**: `npm install`, `npm run dev`, `npm run build`; drop Ruby/bundle/Jekyll serve.
- **Conventions used in `index.html`**: retarget to `src/pages/index.astro` and components; keep the theming, heading outline, hero-agnostic, apps/projects, analytics, avatar fallback, charset and SEO sync rules; remove "keep both blocks in sync" mirror language, since tokens now live in `theme.css` only; remove "no CDN / inline only" wording as a build rule (analytics and conditional mermaid exceptions stay).
- **The blog**: layouts, shared CSS mirror, footer duplication, Rouge classes (now Shiki), mermaid script location, SEO metadata (now in `Base.astro`), RSS/sitemap (no jekyll-feed/sitemap; custom Atom endpoint), `exclude:` in `_config.yml` (gone), homepage latest-posts generation (now Astro).
- **Creating a new blog post**: same steps; replace the Jekyll preview step with the Astro dev server; `{% raw %}` guidance (not needed in Astro; compat plugin tolerates it); keep `future: true` rationale as "no date filtering".
- **Post cover images**: unchanged, mention the copy-to-public step.
- Add a short section for the design system: kit pin, theme file location, link to `docs/design/design-system.md`.
- The `.agents/blog-writer.md` and `.agents/cover-image.md` files must be checked for Jekyll/`bundle exec` wording.

## Accessibility & performance budget
- No change to contrast; pairs listed in the design-system doc; body text at least 4.5:1, focus rings 2px accent preserved, tap targets (toggle 36px) preserved.
- Landmarks and heading outline identical (single `h1`; section labels `h2`).
- Zero client JS except: theme script (inline, pre-paint), tag filter on `/blog/`, mermaid (conditional), analytics. No framework hydration islands in phase 1.
- Lighthouse (mobile) for `/`, `/blog/` and one post must be equal or better than the Jekyll site on performance, accessibility, SEO and best practices; no CLS from avatar, covers (keep width/height) or theme flash.
- Cover images keep their current size; no new media.

## Acceptance criteria
- [x] `npm ci && npm run build` succeeds from a clean checkout; output `dist/` contains `/index.html`, `/blog/index.html`, every post at `/blog/YYYY/MM/DD/<slug>/index.html` (25 posts today, count equals `_posts/` count), `/feed.xml`, `/sitemap.xml`, `/404.html`, `/robots.txt`, `/CNAME`, `/favicon.svg`, `/favicon-32.png`, `/apple-touch-icon.png`, `/icon-512.png`, `/og-image.png`, `/assets/images/posts/*.png` (every file present).
- [x] Set of URLs in the new `/sitemap.xml` equals the old one (excluding 404), compared by diff against the live site.
- [x] No `{% ... %}` or `{{ ... }}` Liquid text appears in rendered posts except text that was inside `{% raw %}` blocks (e.g. `{{branch}}`), which renders verbatim; every `post_url` link resolves to a built page.
- [x] Rendered text of every post (stripped HTML) matches the Jekyll output, apart from whitespace.
- [x] Code blocks: colors match the current Rouge palette in both themes on at least one Swift, one shell and one YAML sample; mermaid renders on all 5 posts that use it, in both themes, and re-renders on toggle; pages without mermaid do not request the CDN. (palette matches; about 2 percent of token runs differ, see notes)
- [x] `/feed.xml` validates as Atom; parsed with the grove-website `blog.js` logic it yields entries with `title`, absolute `link` href, `published`, `summary` or `content`, and `category` terms; the `grove` filter returns the same posts as the current feed; entry `id`s equal the previous ones; CORS header `Access-Control-Allow-Origin: *` present after deploy. (CORS header only checkable after deploy; the current live feed already sends it)
- [x] Per-page SEO output is identical to today: `<title>`, description, canonical, `og:*`, `twitter:*`, `article:*`, JSON-LD (`WebSite`+`Person`, `BlogPosting`+`BreadcrumbList`, `Blog`), `noindex` on 404 only. (one deviation: JSON-LD `wordCount`, see notes)
- [x] Visual regression (screenshots, dark + light, 1440px and 390px) for `/`, `/blog/`, a code post, a mermaid post, `/404.html`: no differences beyond sub-pixel antialiasing; computed values of the ten color tokens match the table in both themes and under OS dark with no `data-theme`.
- [x] Theme toggle: persists `molayab-theme`, updates `#themeColorMeta`, no flash on load, reduced-motion respected.
- [x] Avatar: blocking `github.com/molayab.png` shows the "M" fallback with no layout shift.
- [x] Kit is installed from the pinned tag tarball (no `main`, no copy in repo); `core.css`/`foundation.css` not imported; no hard-coded brand hex in components (only in `theme.css` and the avatar/app-icon SVG gradients that exist today).
- [x] Grove contract: a post added in the current release-blogger format (front matter + PNG at `assets/images/posts/<slug>.png`) builds and appears on `/blog/`, the homepage Latest posts, the feed and the sitemap with no other edits.
- [ ] Workflow: PR run builds without deploying; run on `master` deploys; manual settings steps above completed and recorded in the PR. (NOT VERIFIED: needs a PR and the manual Pages switch)
- [x] AGENTS.md sections above updated in the same PR; `docs/design/design-system.md` changelog updated; no AI attribution in code, comments, docs, commits or PR text.

## Human decisions (2026-11-14)
1. `{% raw %}`/`{% post_url %}`: keep them in the posts and handle them with the remark compat plugin. Post files are not rewritten.
2. Feed size: 10 entries, as today.
3. Code colors: a custom Shiki theme that matches today's Rouge colors exactly.
4. Toggle: a site-side override in phase 1. No kit release.
5. Post covers stay in `assets/images/posts/` and are copied into the build. `molayab/grove` does not change.
6. The feed `<link rel="alternate">` type is corrected to `application/atom+xml`.
7. Switching the Pages source to GitHub Actions is a manual step at merge time. Confirm it with the human at gate 2.
8. `--text-3` contrast is deferred to phase 2.

## Open questions for the human (resolved above)
1. Existing posts: leave `{% raw %}`/`{% post_url %}` in place and rely on the compat plugin (this plan), or rewrite those 4 and 5 posts to plain Markdown links later? Rewriting changes post files, so it needs your approval.
2. Feed size: keep jekyll-feed's 10 most recent entries (like-for-like), or include all posts? Grove's `grove` filter only sees what is in the feed.
3. Code colors: reproduce the current Rouge palette exactly (this plan), or accept the closest stock Shiki theme to reduce maintenance?
4. Kit change (floating toggle variant, new tag): do it now in the kit repo, or keep a site-side override for phase 1 and revisit in phase 2?
5. Post PNGs: copy `assets/images/posts` into the build (this plan, keeps `release-blogger` untouched), or move to `public/` and update `molayab/grove`?
6. `rel="alternate" type="application/rss+xml"` points at an Atom feed today. Keep as is (like-for-like) or correct to `application/atom+xml`? It is invisible to visitors but is an SEO-reviewer call.
7. Pages settings change and rollback plan above: confirm you will switch the Pages source to "GitHub Actions" yourself at merge time.
8. Existing weakness for phase 2: `--text-3` fails contrast (2.2:1) where used for text. Out of scope here; confirm it should be handled with the teal work.

## Implementation notes

Branch `astro-migration-phase-1` (nothing committed). Astro 7.4.12, design-template-kit v0.1.1 tarball, lockfile committed, `npm ci && npm run build` passes with no warnings (28 pages).

Files added: `package.json`, `package-lock.json`, `astro.config.mjs`, `.github/workflows/deploy.yml`, `src/content.config.ts`, `src/data/{site,home}.ts`, `src/lib/posts.ts`, `src/layouts/{Base,Post}.astro`, `src/components/*` (Hero, ProjectCard, RepoCard, PostFeature, PostRow, PostCard, TagFilterBar, Tag, Footer, ThemeToggle, SiteMark), `src/pages/*` (index, blog index, post, 404, feed.xml.ts, sitemap.xml.ts), `src/styles/{index,theme,site,home,post}.css`, `src/scripts/{theme,tag-filter,mermaid,share}.js`, `src/plugins/{remark-liquid-compat,remark-kramdown-typography,remark-no-autolink-literals,code-theme}.mjs`, `src/integrations/copy-post-covers.mjs`.
Moved to `public/`: CNAME, robots.txt, favicons, og-image.png. Removed (Jekyll): `_layouts/`, `_includes/`, `Gemfile`, `_config.yml`, `blog/index.html`, `404.html`, `index.html`, `assets/css/`. Plan says keep Jekyll removal in a separate commit from the Astro addition: publisher should split them. Edited: `AGENTS.md`, `.gitignore`, `docs/design/design-system.md`. `_posts/` and `assets/images/posts/` untouched. `.agents/*` and `molayab/grove` `release-blogger.md` contain no Jekyll/bundle/raw wording, so no change needed there.

Verification (baseline: a local Jekyll build of master with Ruby 3.1 and TZ=UTC, plus the live site):
- All 25 posts built; every required path and every cover PNG present; no broken internal links; no `{% %}` in output; `{{branch}}`-style text renders verbatim; all 5 `post_url` links resolve; an unknown `post_url` fails the build.
- Post body text identical to Jekyll for all 25 posts (whitespace-collapsed), body HTML structure identical (apart from code token spans and the Rouge wrapper). Homepage, blog and 404 head tags, JSON-LD and main content identical.
- Sitemap: same 27 URLs as Jekyll and the live site. Feed: Atom, 10 entries, titles, links, ids, published, updated, categories and summaries identical to Jekyll; 10 `grove` entries as before. Entry `id` is the post URL WITHOUT the trailing slash (what jekyll-feed emitted), not "equal to the canonical URL" as the plan text says; the acceptance line (ids equal the previous ones) wins.
- Screenshots (headless Chrome, `/`, `/blog/`, code post, mermaid post, `{% raw %}` post, 404; 1440 and 390 wide; light and dark): home, blog, 404, mermaid and raw pages are pixel-identical to Jekyll. The code post differs only in some code token colors.
- Computed values of the 11 tokens match in light, dark and OS-dark with no `data-theme`; OS-light with no attribute gives the light values. Toggle persists `molayab-theme` and updates `#themeColorMeta`. Mermaid renders in both themes and re-renders on toggle; the home page makes no jsdelivr request. Avatar failure shows the fallback with no layout shift. No horizontal scroll. Console only shows the Cloudflare beacon CORS error on localhost (same as Jekyll).
- Lighthouse mobile on `/`: identical to Jekyll (a11y 100, best practices 96, SEO 100).
- Grove contract: a temporary post in release-blogger format plus PNG appeared on `/blog/`, the homepage, feed and sitemap with no other edit (then removed).

Deviations from the plan, with reasons:
1. Astro 7's default Markdown processor is not unified, so `@astrojs/markdown-remark` is a new dependency and `markdown.processor: unified(...)` is used.
2. The Liquid compat plugin wraps the parser and rewrites the source text, because `[x]({% post_url ... %})` is not a valid link for a Markdown parser.
3. Two extra remark plugins were needed to keep rendered text unchanged: kramdown-compatible smart quotes/dashes (stock smartypants differs, e.g. `"+"`) and unwrapping of GFM autolink literals (kramdown does not link bare emails). Smartypants is disabled.
4. Custom `/sitemap.xml` endpoint instead of `@astrojs/sitemap` (allowed by the plan; one fewer dependency).
5. `compressHTML: false` so inline whitespace is preserved. Single `styles/index.css` entry (all partials, cascade order) instead of per-page CSS, because Astro placed page CSS before layout CSS.
6. Kit sets `color-scheme` on `:root`; `theme.css` resets it to `normal` so scrollbars and form controls do not change.
7. Code blocks are wrapped as `div.highlighter-rouge > div.highlight > pre.highlight` and inline code keeps the 12px radius, because the Jekyll CSS applied the Rouge rules to both. Result: nested double box around code blocks exactly as today.
8. Code colors: the theme maps TextMate scopes to the Rouge palette; about 2 percent of token runs (e.g. Swift `.`/`,` inside larger tokens, capitalized call names) are colored differently because Rouge and TextMate tokenize differently. The palette itself is identical.
9. JSON-LD `wordCount` differs: Jekyll counted the whole article chrome plus the share script (about 30 to 70 extra words); this build counts the post body only. Flagged for the SEO reviewer.
10. Share link uses CGI-style encoding (`+` for spaces) to match Jekyll. Footer year is the build year on both pages (homepage was hardcoded 2026). Homepage favicon hrefs are now root-absolute.
11. Known text difference vs kramdown: none remaining in the 25 existing posts. Cloudflare's email obfuscation on the live site is not a real difference.

Not verified: CORS header and the `github-pages` environment on the real deploy; the PR-build-only behaviour of the workflow; Lighthouse on `/blog/` and post pages (only `/` was compared); reduced-motion behaviour was not tested interactively (CSS is unchanged); the OS-light no-JS flash was not measured.

Manual steps for the human (unchanged from the plan): merge only after the workflow passes on the PR; set Pages source to "GitHub Actions"; confirm custom domain and HTTPS; check `/feed.xml` CORS, `/sitemap.xml`, `/404.html` and a post after the first deploy; allow `master` on the `github-pages` environment if protected.

Requests for webpage-designer: (a) decide whether the nested double box around code blocks (an artifact of the Rouge markup plus CSS) should be fixed in phase 2; (b) a11y finding that exists today: `aria-label` on project cards, repo cards and two footer links does not contain the visible text (Lighthouse label-content-name-mismatch); (c) `--text-3` contrast stays deferred to phase 2; (d) the kit could offer a floating toggle variant later (site-side override used now).

## SEO review

Gate: applied (human approved S1, S2 on 2026-11-14)

Apply log (2026-11-14): S1 applied: `src/layouts/Base.astro` now emits `rel="canonical"` only when the page is not `noindex` (404 loses it; `og:url` kept; all other pages unchanged). S2 applied: `src/components/Footer.astro` aria-labels changed to `@molayab_ on X` and `Email hello@molayab.com` (start with visible text). Built output re-inspected: 28 pages, the only diffs vs the previous build are the 404 canonical line and those two labels on every page. Files changed: `src/layouts/Base.astro`, `src/components/Footer.astro`, this plan. No visual change vs the designer plan. Project/repo card labels on `/` were not in the approved ids and are untouched. Security review must run again on the final state.

Audit date 2026-11-14, mode audit, built output (`npm run build`, 28 pages) inspected, compared with the live site and the previous Jekyll output. Verdict: no SEO regression found. Proposals below are optional improvements, both pre-existing on the live site.

| Id | Severity | Page(s) | Finding | Why it matters | Exact proposed change | Human decision? |
|---|---|---|---|---|---|---|
| S1 | low | `/404.html` | The 404 page carries `<link rel="canonical" href="https://molayab.com/404.html">` and `og:url` of the same, plus `noindex`. Same as live today. A canonical on a noindex error page sends a mixed signal. | Crawlers get "index this" (canonical) vs "do not index" (noindex). Harmless in practice, cleaner to drop. | In `src/layouts/Base.astro`, omit the `rel="canonical"` tag (keep `og:url` optional) when the page is `noindex`. Old: canonical emitted on 404. New: no canonical on 404. | No (technical). Skip if strict like-for-like is preferred. |
| S2 | low | Footer on `/`, `/blog/`, posts | Lighthouse `label-content-name-mismatch` on the X and email footer links: `aria-label="X (Twitter)"` / `"Email"` while the visible text is `@molayab_` / `hello@molayab.com`. Already known and listed in "Requests for webpage-designer (b)"; identical on live. Accessibility, not ranking. | Voice-control users cannot activate the link by its visible text. Lighthouse a11y is 100 anyway. | In `src/components/Footer.astro`, drop the `aria-label` on those two links (visible text is already descriptive), or change it to start with the visible text, e.g. `aria-label="@molayab_ on X"`. Project and repo cards have the same pattern on `/` only. | Yes (designer's call, changes accessible names). May be deferred to phase 2. |

### Specific points asked about

- **JSON-LD `wordCount` (deviation 9): accept.** Built value for `grove-0-10-1` is 651; live Jekyll says 708 because it counted chrome and the share script. Body-only is the correct meaning of `wordCount`, search engines do not use it as a ranking input, and the field is not displayed. No action.
- **Feed `<link rel="alternate" type="application/atom+xml">`: correct and approved.** The feed is Atom (`xmlns="http://www.w3.org/2005/Atom"`, `rel="self"` with the same type). Live site says `application/rss+xml`. Feed readers and autodiscovery work better with the right type. It is the only head change, confirmed on `/`, a post and 404. `blog.js` does not read this link.

### Checked, no issues

- URLs: 25 posts at `/blog/YYYY/MM/DD/slug/`; all required paths exist in `dist/` (`/`, `/blog/`, `/feed.xml`, `/sitemap.xml`, `/404.html`, `/robots.txt`, `/CNAME`, favicons, `og-image.png`, post covers). Live post URL (`/blog/2026/11/14/grove-0-10-1/`) returns 200 and the built path is identical.
- Sitemap: flat `/sitemap.xml`, valid XML, 27 URLs (live also 27), 404 excluded, post `lastmod` from post dates; `/` and `/blog/` have no `lastmod`, as with jekyll-sitemap. `robots.txt`: `Allow: /` plus `Sitemap: https://molayab.com/sitemap.xml`.
- Feed: valid XML, Atom, absolute links, `published`/`updated`, categories, ids (no trailing slash, as jekyll-feed), 10 entries, `grove` category present (per implementation notes).
- Every built page: exactly one `<h1>`, title and description unique, self-referencing absolute canonical on `https://molayab.com` (except the 404 note in S1), all JSON-LD blocks parse (`WebSite`+`Person` on `/`, `BlogPosting`+`BreadcrumbList` on posts), OG/Twitter complete (`og:title/description/url/image/type/locale`, `twitter:card`), `article:published_time`/`modified_time`/`tag` on posts, post cover images 1200x630 with width/height, empty alt (decorative, per AGENTS.md), first cover eager with `fetchpriority="high"`, covers lazy below the fold. `noindex` only on 404. `html lang="en"`.
- Lighthouse mobile (local `astro preview`): `/blog/` and a post (`/blog/2026/11/14/grove-0-10-1/`): Accessibility 100, Best Practices 96, SEO 100. `/` was already 100/96/100 per the notes. Only failures: console error (Cloudflare beacon CORS on localhost, dev-only noise, same as Jekyll) and the S2 label mismatch. Performance was not run (the Lighthouse tool excludes it, no trace taken).
- Freshness: no hardcoded versions or prices changed by the migration. Repo-card star counts are hardcoded as before and were not re-checked against GitHub in this review (not part of the migration). Footer year is now the build year.

### Pre-existing content notes (not migration issues, no proposal)

Some post titles are long (for example `mac-mini-home-server`, 103 characters; several 79 to 94) and many descriptions exceed 160 characters, so SERPs will truncate them. This is the same on live. Mention only; editing them is a content decision outside this migration.

### Could not check

CORS header on `/feed.xml` and the Pages environment (only verifiable after deploy; live feed sends `Access-Control-Allow-Origin: *`); the PR-build-only workflow; Lighthouse performance and the desktop profile; real-world indexing after the Pages source switch (after deploy, confirm `/sitemap.xml` and a post return 200 and that the custom domain and HTTPS survive the switch).

## Security review

Verdict: PASS

Reviewed: ef43e87f0ec57dbe890d69579b0c086132741069 on 2026-11-14 (re-review after the gate 2 fixes for W2, W3 and W5).

Previous review: `325efb2abc0ee2ef83a0336fda930a815a1ac417`. I rebuilt that fingerprint by putting back the pre-fix `.github/workflows/deploy.yml` and `.gitignore`, and it matches exactly. So since the previous review, only those two files changed. All other staged, unstaged and untracked content, including `package-lock.json`, `src/` and `AGENTS.md`, is byte-identical to what I reviewed before. The mtimes agree: only those two files were modified after 21:10.

No secrets, no PII outside the profile's intentional contacts, no exploitable code issue and 0 npm advisories (`npm audit` re-run: 0). The only non-registry dependency is the approved `design-template-kit` v0.1.1 tag tarball. The open warnings below are for the human at the publish gate. None of them blocks release.

| # | Severity | File:line | What | Why it matters | Suggested fix | Status |
|---|---|---|---|---|---|---|
| W1 | medium | `src/scripts/mermaid.js:5` | mermaid loads from `cdn.jsdelivr.net/npm/mermaid@11/...`: a floating major version with no `integrity`. Master's Jekyll layout did the same, and the profile allows the origin. | Third-party code runs with full page access on the 5 posts with diagrams. | Pin an exact version and add `integrity` + `crossOrigin="anonymous"`, or bundle it from npm. | Open. Out of scope by human decision. |
| W2 | low | `.github/workflows/deploy.yml` | `pages: write` / `id-token: write` were set for the whole workflow. | Least privilege for the build job, which runs on PRs. | Move them to the `deploy` job. | **Fixed.** Workflow level is `contents: read` only. The `build` job declares no `permissions`, so it inherits `contents: read`. The `deploy` job has `contents: read`, `pages: write`, `id-token: write`. |
| W3 | low | `.github/workflows/deploy.yml` | Workflow-level `concurrency: pages` also covered PR builds. | A PR build could replace a queued master deploy. | Put concurrency on `deploy` only. | **Fixed.** `concurrency: {group: pages, cancel-in-progress: false}` is now only on `deploy`, which is skipped on `pull_request` (`if: github.event_name != 'pull_request'`). PR builds are not in any concurrency group. |
| W4 | low | `.github/workflows/deploy.yml` (`uses:` lines) | First-party actions are pinned to major tags, not SHAs. `actions/checkout` keeps the default `persist-credentials`. | A moved tag would change what runs in the deploy pipeline. | Pin to full SHAs, and set `persist-credentials: false` on checkout. | Open. Out of scope by human decision. |
| W5 | low | `.gitignore:6-7` | `.env*` was not ignored. | A future `.env` could be committed by accident. | Add `.env` and `.env.*`. | **Fixed.** No tracked file matches `.env*`, so the new patterns hide nothing that should ship. |
| I1 | info | `src/pages/feed.xml.ts:28,31,36`, `sitemap.xml.ts:13` | URLs in XML are not XML-escaped (`&` would make the XML invalid). The data is repo-controlled. | Validity only. This is not an injection risk. | Optional: run URLs through `esc()`. | Open (info). |
| I2 | info | `src/plugins/remark-liquid-compat.mjs`, `astro.config.mjs` | Raw HTML in `_posts/` is rendered as HTML, as kramdown did. | Inbound Grove posts arrive by PR. Human PR review is the control. | None. | Open (info). |

### Checked in this re-review
- Fix correctness: I parsed `deploy.yml` with Ruby's YAML loader and checked the permissions and concurrency per job (see the table). Triggers are still `push` to master, `pull_request` and `workflow_dispatch`. There is no `pull_request_target`, no `secrets.*`, and no `${{ github.event.* }}` or other untrusted interpolation. The only expression in the file is `${{ steps.deployment.outputs.page_url }}` in `environment.url`, which is set by `actions/deploy-pages`, not by PR input. The upload-artifact step and the deploy job are still skipped on PRs.
- Nothing else changed: see the fingerprint reconstruction above. The branch still has no commits beyond `master`.
- The earlier full review (secrets, PII, client JS, Astro, dependencies, non-registry tarball) still applies unchanged, because the content it covered is byte-identical.

### Could not check
- Whether tag `v0.1.1` of `design-template-kit` points at the intended commit on the remote (lockfile integrity protects later installs only).
- gitleaks, trufflehog and exiftool are not installed. I scanned for secrets with grep only (previous review).
- The live behaviour of the `github-pages` environment protection and of the PR build-only path. Verify on the first PR run and the first master deploy.

## Security findings to fix (human-approved at gate 2, 2026-11-14)
The human approved publishing after these fixes. Fix only these:
- W2: move `pages: write` and `id-token: write` from the workflow level in `.github/workflows/deploy.yml` to the `deploy` job only. The build job keeps `contents: read`.
- W3: move the `concurrency` group to the `deploy` job only, or split it by event, so PR builds can't cancel a queued master deploy.
- W5: add `.env` and `.env.*` to `.gitignore`.
W1 (mermaid pinning/SRI) and W4 (pinning actions to a SHA) are out of scope for this change.

### Security fixes applied (gate 2)
- W2: `pages: write` and `id-token: write` moved to the `deploy` job; workflow level keeps `contents: read`.
- W3: `concurrency` group `pages` moved to the `deploy` job, so PR builds cannot cancel a queued master deploy.
- W5: `.env` and `.env.*` added to `.gitignore`.
- W1 and W4 remain out of scope. Verified: YAML parses, `npm run build` passes.
