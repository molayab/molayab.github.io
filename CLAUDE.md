# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`molayab.github.io` is Mateo Olaya Bernal's personal portfolio site, served via GitHub Pages at the custom domain in `CNAME` (molayab.com). It is a single static HTML page — there is no build system, package manager, framework, or test suite. The entire site is:

- `index.html` — the whole page: markup, `<style>`, and `<script>` inline in one file.
- `CNAME` — GitHub Pages custom domain config (`molayab.com`). Do not remove; deleting it drops the custom domain and reverts the site to the default `*.github.io` URL.
- `favicon.svg` / `favicon-32.png` / `apple-touch-icon.png` / `icon-512.png` — the site's "M" monogram mark (green gradient, matches the Grove app icon) at various sizes. Regenerate all sizes together if the mark changes, via a headless-browser screenshot of `favicon.svg` — see git history for the render script.
- `og-image.png` — 1200×630 social-share preview (name, title, tag pills, brand gradient), referenced by the `og:image`/`twitter:image` meta tags. Regenerate the same way if the hero title or tagline changes, so the shared-link preview stays in sync.
- `robots.txt` / `sitemap.xml` — basic crawler config pointing at the single page.

## Development workflow

There is no build/lint/test tooling — edit `index.html` directly and open it in a browser to preview (e.g. `open index.html` or a local static file server). Any commit pushed to the default branch is what GitHub Pages deploys, so changes go live as soon as they land on `master`.

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
