# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`molayab.github.io` is Mateo Olaya Bernal's personal portfolio site, served via GitHub Pages at the custom domain in `CNAME` (molayab.com). It is a single static HTML page — there is no build system, package manager, framework, or test suite. The entire site is:

- `index.html` — the whole page: markup, `<style>`, and `<script>` inline in one file.
- `CNAME` — GitHub Pages custom domain config (`molayab.com`). Do not remove; deleting it drops the custom domain and reverts the site to the default `*.github.io` URL.

## Development workflow

There is no build/lint/test tooling — edit `index.html` directly and open it in a browser to preview (e.g. `open index.html` or a local static file server). Any commit pushed to the default branch is what GitHub Pages deploys, so changes go live as soon as they land on `master`.

## Conventions used in `index.html`

- **Theming**: colors are CSS custom properties on `:root`, with dark mode driven two ways — `@media (prefers-color-scheme: dark)` for OS-level preference, and `:root[data-theme="dark"|"light"]` overrides for the manual toggle (bottom-right button, persisted to `localStorage['molayab-theme']`). When changing colors, update both the light block (`:root`) and the dark block (both the media query and the `data-theme="dark"` selector) to keep them in sync.
- **Layout**: single-column, centered `.page` container (max-width 680px). Sections are hero → apps list → footer, separated by `<hr class="rule">`.
- **Apps section**: each shipped app is a `.project-card` link (icon as inline SVG, category/name/description, external link). Unreleased/upcoming apps use `.project-placeholder` instead. Follow the existing SVG icon pattern (gradient-filled rounded-square app icon) when adding a new app card.
- **Analytics**: Cloudflare Web Analytics beacon script in `<head>` — keep the `data-cf-beacon` token if editing that block.
- No external CSS/JS dependencies or CDN libraries are used; keep new additions inline and dependency-free unless there's a strong reason otherwise.
