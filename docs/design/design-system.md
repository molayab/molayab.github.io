# molayab.com design system

Reference for the site's visual language. Source of truth: `src/styles/theme.css` (brand +
semantic values) on top of the `design-template-kit` tokens (migrated from Jekyll in plan
`2026-11-14-astro-migration-phase-1`).

## Brand principles

- Personal, quiet, technical. Single centered column (680px), generous whitespace.
- One accent family: teal-green (hue 170, shifted from the earlier green by plan `2026-11-14-astro-migration-phase-2`). Dark mode is black with a soft teal-green ambient glow; light mode is warm paper. Grove (the app and grove.molayab.com) keeps its own brand green; the site may differ from it.
- Hero stays agnostic (name, neutral title, factual tagline); story lives in About.
- No third-party UI dependencies; analytics beacons are the only external scripts. Mermaid is bundled from npm (11.x) and loaded lazily on diagram posts only.

## Color tokens

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--bg` | #F6F5F0 | #000000 | page background |
| `--surface` | #FFFFFF | #1E1E1B | cards, toggle |
| `--surface-2` | #EEECE5 | #242420 | inset surfaces, code, pills |
| `--border` | rgba(26,58,54,.10) | rgba(160,220,208,.12) | hairlines |
| `--accent`, `--accent-text`, `--brand`, `--brand-on-light` | #187263 | #52B7A6 (`--brand-on-dark`) | links, focus rings, emphasis |
| `--glow` | #52B7A6 | #52B7A6 | ambient gradient, covers |
| `--text` | #211F1A | #F5F3ED | body |
| `--text-2` | #5E5B55 | #A8A499 | secondary |
| `--text-3` | #6B6862 | #938F85 | tertiary (still real text: passes AA) |
| `--ambient` | transparent | rgba(82,183,166,.16) | header glow |
| `--shadow-hover` | 0 10px 30px rgba(24,114,99,.14) | 0 10px 30px rgba(0,0,0,.45) | card hover |
| `--brand-grad-start` / `--brand-grad-end` | #52B7A6 / #1B433C | same (theme-independent) | avatar fallback, site mark, favicon |

Gradients live in `theme.css` only; component CSS uses `--brand-grad-*`. Cover/OG background: #050705 with the glow.

Contrast (WCAG 2.x, recomputed 2026-11-14 on the rendered pages; every text pair is at least 4.5:1):

| Pair | Light | Dark |
|---|---|---|
| text / bg, surface, surface-2 | 15.08, 16.46, 13.93 | 18.93, 15.06, 14.04 |
| text-2 / bg, surface, surface-2 | 6.20, 6.77, 5.72 | 8.44, 6.71, 6.26 |
| text-3 / bg, surface, surface-2 | 5.09, 5.55, 4.70 | 6.51, 5.18, 4.83 |
| accent / bg, surface, surface-2 | 5.31, 5.79, 4.90 | 8.68, 6.91, 6.44 |
| white on filled accent (`--brand-contrast`) | 5.79 | n/a |

Known gap: the light-theme syntax token colors (`--code-keyword` #9B4FBD, `--code-string` #C17A3D, `--code-fn` #2B79B0) are 4.2, 2.9 and 4.0 on `--surface-2`. They predate phase 2 (copied from the Rouge palette) and are listed as a request for the designer.

## Typography

System stack: `system-ui, -apple-system, 'Helvetica Neue', sans-serif`; mono
`ui-monospace, 'SF Mono', Menlo, monospace`. Body 17px / 1.65. No web fonts.

## Spacing, layout, breakpoints

Centered `.page` column, max-width 680px; hero padding 96px 0 80px; sections separated by `hr.rule`.
Radii: 20px (cards), 12px (small), 980px (pills). Breakpoints in use: 480px (repo grid to one column, project-card compact)
and the post-row stacking breakpoint defined in the homepage styles. Motion easing `cubic-bezier(0.16, 1, 0.3, 1)`.

## Component inventory

| Component | Purpose | Lives in |
|---|---|---|
| theme toggle | manual light/dark, persisted `localStorage['molayab-theme']` | `ThemeToggle.astro`, kit `theme-toggle.css` with the `.theme-toggle--floating` modifier (kit v0.2.0), `scripts/theme.js` |
| hero + avatar (with monogram fallback) | identity header | `index.html`, `site.css` |
| eyebrow (`h2.eyebrow`) | section label | both |
| project-card / project-placeholder | shipped / upcoming app; the link's accessible name comes from its visible content (no `aria-label`) | `ProjectCard.astro` |
| repo-card + repo-grid | GitHub repo; accessible name from visible content (no `aria-label`) | `RepoCard.astro` |
| post-feature / post-row | homepage latest posts | `index.html` |
| post-card / post-list / tag-filter | blog listing | `post.css` |
| tag pill (`.tag`) | post tag | `index.html`, `post.css` |
| prose, code blocks (one box: the outer `.highlighter-rouge` draws it; inline code radius 6px), mermaid container | article body | `post.css` |
| footer | social links, Blog or RSS link | `_includes/footer.html`, `index.html` |

## Motion

fadeUp on hero (0.6s), card hover lift 2px, icon nudges. `prefers-reduced-motion: reduce` collapses all animation and transition durations to ~0.

## Imagery

Post covers: 1200x630 PNG, abstract diagram, black #050705, flat line art, never a title card. New covers use the teal-green glow #52B7A6; the 25 covers made before phase 2 keep the old #52B788 glow.
OG image 1200x630 and the favicon family are regenerated with the teal-green gradient "M" monogram.

## Accessibility

Body text at least 4.5:1, large text/UI at least 3:1, visible `:focus-visible` outline (2px accent), tap targets at least 24px,
`h1` only for the page title, section labels are `h2`. `--text-3` is real text and must pass AA. Link cards take their accessible name from their visible content, never a differing `aria-label` (Lighthouse label-content-name-mismatch).

## Changelog

- 2026-11-14: document created from the existing pages; documents current state only. Plan `2026-11-14-astro-migration-phase-1` will move the source of truth to `src/styles/theme.css`.
- 2026-11-14: Astro migration phase 1 implemented like-for-like. Source of truth moved to `src/styles/theme.css`; no token values changed. Kit `color-scheme` is reset to `normal` so scrollbars and form controls render as before. Code token colors are applied through a Shiki theme that reads the `--code-*` variables.
- 2026-11-14: Astro migration phase 2 implemented. Palette shifted to teal-green (option B, hue 170); `--text-2` and `--text-3` raised to pass AA on all surfaces; `--brand-grad-start/-end` added; card `aria-label`s removed; code blocks draw one box and inline code radius is 6px; favicon family and `og-image.png` regenerated, post covers kept; mermaid bundled from npm; Actions SHA-pinned.
