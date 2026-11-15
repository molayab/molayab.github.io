# molayab.com design system

Reference for the site's visual language. Source of truth: `src/styles/theme.css` (brand +
semantic values) on top of the `design-template-kit` tokens (migrated from Jekyll in plan
`2026-11-14-astro-migration-phase-1`).

## Brand principles

- Personal, quiet, technical. Single centered column (680px), generous whitespace.
- One accent family: green. Dark mode is black with a soft green ambient glow; light mode is warm paper.
- Hero stays agnostic (name, neutral title, factual tagline); story lives in About.
- No third-party UI dependencies; analytics beacons and conditional mermaid are the only external scripts.

## Color tokens (current values, like-for-like in phase 1)

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--bg` | #F6F5F0 | #000000 | page background |
| `--surface` | #FFFFFF | #1E1E1B | cards, toggle |
| `--surface-2` | #EEECE5 | #242420 | inset surfaces, code, pills |
| `--border` | rgba(26,58,41,.10) | rgba(160,220,190,.12) | hairlines |
| `--accent` | #1A7A4A | #52B788 | links, focus rings, emphasis |
| `--glow` | #52B788 | #52B788 | ambient gradient, covers |
| `--text` | #211F1A | #F5F3ED | body |
| `--text-2` | #6B6862 | #8C887E | secondary |
| `--text-3` | #ABA79C | #4A4740 | tertiary/decorative only |
| `--ambient` | transparent | rgba(82,183,136,.16) | header glow |
| `--shadow-hover` | 0 10px 30px rgba(26,122,74,.14) | 0 10px 30px rgba(0,0,0,.45) | card hover |

Brand gradient (avatar fallback, favicon, app icons): #52B788 to #1B4332.
Cover/OG background: #050705 with #52B788 glow.

Contrast (WCAG, computed 2026-11-14):

| Pair | Ratio | Verdict |
|---|---|---|
| dark text / bg | 18.93 | pass |
| dark text-2 / bg | 5.94 | pass |
| dark text-2 / surface | 4.72 | pass |
| dark accent / bg | 8.49 | pass |
| dark text-3 / bg | 2.27 | FAIL for text (decorative use only) |
| light text / bg | 15.08 | pass |
| light text-2 / bg | 5.09 | pass |
| light text-2 / surface | 5.55 | pass |
| light accent / bg | 4.90 | pass |
| light accent / surface | 5.35 | pass |
| light text-3 / bg | 2.20 | FAIL for text (decorative use only) |

`--text-3` must not carry meaningful text. Existing uses are to be reviewed in phase 2.

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
| theme toggle | manual light/dark, persisted `localStorage['molayab-theme']` | `ThemeToggle.astro`, kit `theme-toggle.css` + override in `site.css`, `scripts/theme.js` |
| hero + avatar (with monogram fallback) | identity header | `index.html`, `site.css` |
| eyebrow (`h2.eyebrow`) | section label | both |
| project-card / project-placeholder | shipped / upcoming app | `index.html` |
| repo-card + repo-grid | GitHub repo | `index.html` |
| post-feature / post-row | homepage latest posts | `index.html` |
| post-card / post-list / tag-filter | blog listing | `post.css` |
| tag pill (`.tag`) | post tag | `index.html`, `post.css` |
| prose, code blocks, mermaid container | article body | `post.css` |
| footer | social links, Blog or RSS link | `_includes/footer.html`, `index.html` |

## Motion

fadeUp on hero (0.6s), card hover lift 2px, icon nudges. `prefers-reduced-motion: reduce` collapses all animation and transition durations to ~0.

## Imagery

Post covers: 1200x630 PNG, abstract diagram, black #050705, green glow, flat line art, never a title card.
OG image 1200x630. Favicon family: green-gradient "M" monogram.

## Accessibility

Body text at least 4.5:1, large text/UI at least 3:1, visible `:focus-visible` outline (2px accent), tap targets at least 24px,
`h1` only for the page title, section labels are `h2`.

## Changelog

- 2026-11-14: document created from the existing pages; documents current state only. Plan `2026-11-14-astro-migration-phase-1` will move the source of truth to `src/styles/theme.css`.
- 2026-11-14: Astro migration phase 1 implemented like-for-like. Source of truth moved to `src/styles/theme.css`; no token values changed. Kit `color-scheme` is reset to `normal` so scrollbars and form controls render as before. Code token colors are applied through a Shiki theme that reads the `--code-*` variables.
