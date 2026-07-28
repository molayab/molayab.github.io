# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others) working in this repository. `CLAUDE.md` is a symlink to this file — both names point at the same content, so there's exactly one copy to keep current.

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
- **Layout**: single-column, centered `.page` container (max-width 680px). Sections are hero → about → apps → projects (open source) → blog → footer, separated by `<hr class="rule">`.
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

- **Layouts**: `_layouts/default.html` is the shared page shell (head/meta/analytics/theme-toggle/footer) used by every blog page. `_layouts/post.html` extends it (`layout: default` in its own front matter) and adds the article chrome (back link, date, title, reading time, tags). `blog/index.html` is the post-listing page, sets `layout: default` directly, and lists posts by iterating `site.posts` — there's no hardcoded list to update when a post is added.
- **Shared CSS lives in `assets/css/`, not inline** (unlike `index.html`): `site.css` has the design tokens, reset, and chrome (theme toggle, site mark, hero, rule, eyebrow, footer, tag pill) — it's a hand-kept **mirror of the tokens/chrome CSS inside `index.html`'s `<style>` block**, not a shared `<link>`, since the homepage stays a self-contained file on purpose. If you change a color token or the footer/theme-toggle markup in one place, update the other. `post.css` is blog-only: article typography, code-block/Rouge syntax-highlighting colors, and the post-card/post-list styles.
- **Footer duplication**: `_includes/footer.html` (used on every blog page) and the inline `<footer>` in `index.html` are two copies of the same content plus a swap — the blog footer has an RSS link instead of a Blog link (you're already there), the homepage footer has a Blog link instead of RSS. Keep social links (GitHub/X/Instagram/email) in sync across both when they change.
- **Code blocks**: kramdown + Rouge (fenced ```lang blocks). The `.highlight .k/.s/.nf/...` token classes in `post.css` are real Rouge output classes, not invented ones — if you change the color scheme, check it against actual Rouge output (see git history for how this was verified with a local Jekyll build) rather than guessing class names.
- **Diagrams**: use fenced ` ```mermaid ` code blocks for any diagram in a post — flowcharts, sequence diagrams, architecture sketches — instead of hand-drawn ASCII art. Rouge has no `mermaid` lexer, so kramdown emits these as a plain `<pre><code class="language-mermaid">` (no `highlighter-rouge` wrapper); a small script in `_layouts/default.html` (only loaded on pages whose rendered content actually contains a `language-mermaid` block, via `{% if content contains 'language-mermaid' %}`) replaces each one with a `<div class="mermaid">` and renders it client-side via the mermaid.js CDN bundle, re-rendering with the matching mermaid theme (`dark`/`default`) whenever the theme toggle is used. `post.css` styles both the rendered `.mermaid` container and the pre-JS/no-JS fallback (`pre code.language-mermaid`) so a diagram never renders as unstyled raw text. This is the one deliberate exception to "no CDN dependencies" for the blog (the homepage rule doesn't apply here) — it's loaded conditionally, per-page, so pages without diagrams pay nothing.
- **RSS/sitemap**: `jekyll-feed` and `jekyll-sitemap` (in `_config.yml`'s `plugins:`, both GitHub-Pages-supported) generate `/feed.xml` and `/sitemap.xml` automatically — don't hand-write either.
- **`exclude:` in `_config.yml`** keeps `Gemfile`, `Gemfile.lock`, `CLAUDE.md`, and `AGENTS.md` out of the built site. If you add another repo-internal file that Jekyll would otherwise copy verbatim into `_site/`, add it there too.
- **Homepage discoverability**: the blog also gets a `.project-card` entry on the homepage (same section pattern as Apps), plus a footer link — it's not just buried in the footer. If the blog's tagline/description changes, update it in three places: `blog/index.html`'s hero, this homepage card, and `_config.yml`'s `description`.

### Creating a new blog post

1. **Add a file to `_posts/`** named `YYYY-MM-DD-slug.md`. The date in the filename is what Jekyll uses to build the URL — `_config.yml` sets `permalink: /blog/:year/:month/:day/:title/`, so a file named `2026-08-01-my-post.md` publishes at `/blog/2026/08/01/my-post/`. `:title` in the permalink comes from the filename's slug, not the front matter `title:`.
2. **Front matter** at the top of the file:
   ```yaml
   ---
   layout: post
   title: "Post Title"
   description: "One sentence used for the post-list card and social/meta previews."
   date: 2026-08-01 12:00:00 -0000
   tags: [tag1, tag2]
   image: /assets/images/posts/slug.png
   ---
   ```
   `layout: post` is required (it's what wires up `_layouts/post.html`'s article chrome). `description` isn't optional in practice — `blog/index.html` and the social meta tags fall back to a truncated `post.excerpt` if it's missing, which reads worse than a written one. Check existing posts' `tags:` values before inventing a new tag, to keep the tag set from sprawling. `image:` isn't optional either — see "Post cover images" below before making one.
3. **Write the body** in kramdown (GFM-flavored). Fenced ` ```lang ` code blocks get Rouge syntax highlighting automatically — no extra setup.
4. **Preview locally**: `bundle install` (first time only) then `bundle exec jekyll serve`, and check the post at `http://localhost:4000/blog/...` — confirm the listing card, the tags, and any code blocks render as expected before pushing. `blog/index.html` picks the new post up automatically; there's nothing else to wire up.
5. **Commit and push to the default branch** — GitHub Pages builds and deploys on every push, there's no separate publish step.

### Post cover images

- Every post has an `image:` front matter field pointing at `assets/images/posts/<slug>.png`, a 1200×630 PNG. `default.html`'s `og:image`/`twitter:image` and the JSON-LD `BlogPosting.image` use `page.image` when set, falling back to the site-wide `og-image.png`; `post.html` also renders it as a rounded-corner hero above the article body — so every post needs one before it ships.
- **Never make it a title card.** The image sits directly above the same title/description already on the page (and duplicates what's already in the `<title>`/meta tags) — re-rendering that text as a graphic is pure redundancy, not a cover. Instead, draw a small abstract diagram that illustrates what the post is actually *about* — the concept, not the headline. E.g. `mac-mini-home-server.png` (Mac mini → tunnel → shield → cloud), `ai-agent-dev-team.png` (kanban board → research/plan/build icons → audit shield → merge), `swift-ai-provider-kit.png` (package → three provider icons → chat bubble). Look at the existing images under `assets/images/posts/` before making a new one — they're the reference for both the visual language below and the "one flow, 2–3 nodes" level of abstraction to aim for.
- **Visual language**, shared with `og-image.png`/favicon so covers read as one family: black background (`#050705`), a soft radial accent glow (`#52B788`) centered around 78%/42% of the frame, a faint dot-grid masked to the glow. Icons are flat line-art — white/light strokes (~3px, round caps/joins), no photographic or literal-brand imagery; the "destination" node of the diagram sits inside the glow and can be accent-filled to draw the eye. Dotted accent-colored connector paths (`stroke-dasharray`) link the nodes to suggest a flow/process rather than a static illustration.
- **How it's made**: hand-build a small self-contained HTML file (inline SVG, no external assets) at 1200×630 reusing the recipe above, then rasterize it with a headless Chromium screenshot (`chromium --headless --disable-gpu --window-size=1200,630 --screenshot=out.png file://...`) — the same one-off render-and-discard approach used for `favicon.svg`/`og-image.png` (see git history for prior examples). This needs no build step or repo dependency; the HTML template is scratch work — only the resulting PNG gets committed, to `assets/images/posts/<slug>.png`.
- **Always produce 3 candidate concepts and let a human pick** — different framings of the post's core idea (e.g. input-centered vs. process-centered vs. output-centered), not 3 recolors of the same layout. This is a judgment call about which diagram best represents the post, and that judgment belongs to a person, not whichever agent generated the images. This is exactly what the `cover-image` subagent below automates, but the same rule applies if you're doing it by hand.

### Blog subagents: `blog-writer` and `cover-image`

Two subagents standardize post creation: `blog-writer` drafts the post in this site's voice (see its own instructions for the voice guide and the tone-by-post-type breakdown), then delegates to `cover-image` to design the cover — which comes back with 3 diagram concepts per the rule above instead of just picking one.

Each needs to exist once per agent runtime, because each runtime has its own subagent file format — but the actual instructions have a single source of truth per agent, split by reference rather than duplicated:

- `.agents/blog-writer.md` / `.agents/cover-image.md` — the canonical instructions for each. No frontmatter, plain markdown. **Edit these files, and only these files,** when the voice, process, or visual language changes.
- `.claude/agents/blog-writer.md` / `.claude/agents/cover-image.md` — Claude Code's subagent format (`name`/`description`/`tools`/`model` frontmatter). Each body is a one-line pointer telling the agent to read its `.agents/*.md` counterpart before doing anything else. `blog-writer`'s `tools:` includes `Task` so it can invoke `cover-image`.
- `.opencode/agents/blog-writer.md` / `.opencode/agents/cover-image.md` — opencode's subagent format (`description`/`mode: subagent`/`permission` frontmatter; opencode's older boolean `tools:` field is deprecated in favor of `permission`). Same one-line pointer as the Claude Code versions. `blog-writer`'s `permission` includes `task: allow` for the same reason.

The only content that's genuinely duplicated is the one-paragraph `description:` trigger text in each frontmatter block — each tool reads that field itself to decide when to invoke the subagent, so it can't live in the shared file. Everything an invoked agent actually acts on lives in its `.agents/*.md` file alone.

All of these are under dot-directories, which are already outside Jekyll's default build inputs (Jekyll skips dotfiles/dot-directories unless explicitly `include`d), so none of them need an `exclude:` entry in `_config.yml`.
