# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`molayab.github.io` is Mateo Olaya Bernal's personal site, served via GitHub Pages at the custom domain in `CNAME` (molayab.com). It's two things bolted together on purpose:

1. **The homepage** (`index.html`) — a single hand-authored static HTML page (markup, `<style>`, and `<script>` all inline, no build step). This is deliberately kept simple and self-contained; don't add a build step or external dependency to it.
2. **The blog** (`/blog/`) — built with GitHub Pages' native Jekyll support (Markdown posts in `_posts/`, custom layouts, no CI needed — GitHub builds it on push). See "The blog" section below.

Root-level files:
- `index.html` — the homepage, as above.
- `CNAME` — GitHub Pages custom domain config (`molayab.com`). Do not remove; deleting it drops the custom domain and reverts the site to the default `*.github.io` URL.
- `favicon.svg` / `favicon-32.png` / `apple-touch-icon.png` / `icon-512.png` — the site's "M" monogram mark (green gradient, matches the Grove app icon) at various sizes. Regenerate all sizes together if the mark changes, via a headless-browser screenshot of `favicon.svg` — see git history for the render script.
- `og-image.png` — 1200×630 social-share preview (name, title, tag pills, brand gradient), referenced by the `og:image`/`twitter:image` meta tags site-wide (homepage and blog). Regenerate the same way if the hero title or tagline changes, so the shared-link preview stays in sync.
- `robots.txt` — crawler config; points at `/sitemap.xml`, which `jekyll-sitemap` generates at build time (no static file in the repo).
- `index.html` carries **empty Jekyll front matter** (`---\n---` as the very first bytes) solely so Jekyll registers it as a Page and includes it in the generated sitemap/feed — it has no `layout:` key, so Jekyll renders it standalone, untouched, exactly as authored. Never add a `layout:` key here or it'll get wrapped in `_layouts/default.html` and break the page.

## Development workflow

**Homepage**: no build/lint/test tooling — edit `index.html` directly and open it in a browser to preview (e.g. `open index.html` or a local static file server).

**Blog**: `bundle install` then `bundle exec jekyll serve` for a local preview with drafts/live-reload (needs Ruby; `Gemfile` pins the `github-pages` gem so local output matches what GitHub actually builds). No CI/GitHub Actions involved — GitHub Pages runs Jekyll itself on every push.

Either way: any commit pushed to the default branch is what GitHub Pages deploys, so changes go live as soon as they land on `master`.

## Conventions used in `index.html`

- **Theming**: colors are CSS custom properties on `:root`, with dark mode driven two ways — `@media (prefers-color-scheme: dark)` for OS-level preference, and `:root[data-theme="dark"|"light"]` overrides for the manual toggle (bottom-right button, persisted to `localStorage['molayab-theme']`). When changing colors, update both the light block (`:root`) and the dark block (both the media query and the `data-theme="dark"` selector) to keep them in sync.
- **Layout**: single-column, centered `.page` container (max-width 680px). Sections are hero → about → apps → projects (open source) → footer, separated by `<hr class="rule">`.
- **Hero stays agnostic**: the hero (`.hero-name`/`.hero-role`/`.hero-bio`) is name + a neutral title + a short factual tagline, no first-person narrative. Personal story/bio goes in the About section (`.about-text`) instead.
- **Apps section**: each shipped app is a `.project-card` link (icon as inline SVG, category/name/description, external link). Unreleased/upcoming apps use `.project-placeholder` instead. Follow the existing SVG icon pattern (gradient-filled rounded-square app icon) when adding a new app card.
- **Projects section**: open-source/GitHub repos are `.repo-card` links inside `.repo-grid` (auto-fill grid, collapses to 1 column under 480px) — name, short description, and a `.repo-meta` row (star count + language). Lighter-weight than `.project-card`, meant for pinned/starred GitHub repos rather than shipped apps. When repo star counts or descriptions change on GitHub, update the hardcoded values here to match.
- **Analytics**: two trackers in `<head>` — the Cloudflare Web Analytics beacon (keep the `data-cf-beacon` token) and a Google Analytics (gtag.js) snippet (keep the `G-LNZDWNT4BV` measurement ID). Both are external CDN scripts — the only exception to the "no CDN dependencies" rule below, since they're analytics beacons rather than UI dependencies.
- **Hero avatar**: hotlinked from `https://github.com/<username>.png`, so it always mirrors the current GitHub avatar with no local asset to keep in sync. It's layered over a `.hero-avatar-fallback` monogram (same mark as the favicon/OG image) via `onerror="this.style.display='none'"` — never remove the fallback layer or set the `<img>` to `display:none` by default, or a failed/blocked image load (ad blockers commonly block GitHub avatar requests) shows nothing or overflowing alt text instead of a clean placeholder.
- **Charset**: `<meta charset="utf-8">` must stay the first tag in `<head>` — the page uses em dashes and middots throughout, and without an explicit charset (and depending on the server's `Content-Type` header), some browsers mis-render them.
- **SEO/social metadata**: `<title>`/`meta[name=description]` are deliberately more keyword-rich than the agnostic on-page hero (they're separate surfaces — search results and browser tabs vs. the page itself). Keep `og:*`, `twitter:*`, the JSON-LD `Person` block, and `og-image.png` in sync whenever the title, tagline, or social handles change — they're duplicated across those places on purpose (static file, no templating).
- **Theme-color sync**: the `#themeColorMeta` tag is updated by the same toggle script that flips `data-theme`, so the mobile browser chrome color tracks the manual theme choice, not just OS preference. Keep both in the `apply()` function if you touch the toggle logic.
- No external CSS/JS dependencies or CDN libraries are used; keep new additions inline and dependency-free unless there's a strong reason otherwise.

## The blog

- **New post** = a Markdown file in `_posts/`, named `YYYY-MM-DD-slug.md`, with front matter `layout: post`, `title`, `description` (used for the card excerpt and meta description — always set it explicitly rather than relying on an auto-excerpt), `date`, and optional `tags: [a, b]`. Permalinks are `/blog/:year/:month/:day/:title/` (set in `_config.yml`).
- **Layouts**: `_layouts/default.html` is the shared page shell (head/meta/analytics/theme-toggle/footer) used by every blog page. `_layouts/post.html` extends it (`layout: default` in its own front matter) and adds the article chrome (back link, date, title, reading time, tags). `blog/index.html` is the post-listing page and sets `layout: default` directly.
- **Shared CSS lives in `assets/css/`, not inline** (unlike `index.html`): `site.css` has the design tokens, reset, and chrome (theme toggle, site mark, hero, rule, eyebrow, footer, tag pill) — it's a hand-kept **mirror of the tokens/chrome CSS inside `index.html`'s `<style>` block**, not a shared `<link>`, since the homepage stays a self-contained file on purpose. If you change a color token or the footer/theme-toggle markup in one place, update the other. `post.css` is blog-only: article typography, code-block/Rouge syntax-highlighting colors, and the post-card/post-list styles.
- **Footer duplication**: `_includes/footer.html` (used on every blog page) and the inline `<footer>` in `index.html` are two copies of the same content plus a swap — the blog footer has an RSS link instead of a Blog link (you're already there), the homepage footer has a Blog link instead of RSS. Keep social links (GitHub/X/Instagram/email) in sync across both when they change.
- **Code blocks**: kramdown + Rouge (fenced ```lang blocks). The `.highlight .k/.s/.nf/...` token classes in `post.css` are real Rouge output classes, not invented ones — if you change the color scheme, check it against actual Rouge output (see git history for how this was verified with a local Jekyll build) rather than guessing class names.
- **RSS/sitemap**: `jekyll-feed` and `jekyll-sitemap` (in `_config.yml`'s `plugins:`, both GitHub-Pages-supported) generate `/feed.xml` and `/sitemap.xml` automatically — don't hand-write either.
- **`exclude:` in `_config.yml`** keeps `Gemfile`, `Gemfile.lock`, and `CLAUDE.md` out of the built site. If you add another repo-internal file that Jekyll would otherwise copy verbatim into `_site/`, add it there too.
