---
id: 2026-11-14-astro-migration-phase-2
status: implemented
owner: webpage-designer
approved_by: human
approved_on: 2026-11-14
---
# Astro migration, phase 2: teal-green tint, contrast, a11y names, code boxes, supply-chain pinning

## Goal
Phase 1 shipped the Astro site like-for-like. Phase 2 does the visual and hardening work it deferred: (1) shift the green palette toward teal-green while staying the same brand family, (2) make `--text-3` (and the secondary text pair) pass WCAG AA, (3) fix the accessible names on project and repo cards, (4) remove the nested double box around code blocks, (5) close security warnings W1 (mermaid from an unpinned CDN) and W4 (unpinned GitHub Actions). It worked if: every text pair in the contrast table passes AA in both themes; Lighthouse accessibility on `/` has no `label-content-name-mismatch`; a code block shows one box; `/blog/` posts with diagrams render identically with no request to a third-party origin; the workflow `uses:` lines are SHA-pinned; content, URLs, feed, sitemap, layout and Grove contracts are unchanged.

## Scope
- In: teal tint in `theme.css` and the two hard-coded gradients; asset regeneration decision; contrast fix for `--text-2`/`--text-3`; card accessible names; code block box; inline code radius (see Q5); mermaid pinning; Actions pinning; doc and AGENTS.md updates.
- Out: copy, layout, spacing, type, new pages or components, URLs, feed/sitemap/JSON-LD, post content, the Grove app icon on the homepage (it is rose `#CB2957`, not part of the green family), any kit release (see item 6).
- Split recommendation: items 5 (W1, W4) are non-visual and could ship as their own PR so they are not blocked by the palette choice. Nothing technical forces a split; if the human wants one gate for everything, keep them here. Ask in Q8.

## Design concepts used
Existing tokens (see `docs/design/design-system.md`, "Color tokens"): `--accent`, `--accent-text`, `--glow`, `--ambient`, `--border`, `--shadow-hover`, `--brand*`, `--text-2`, `--text-3`. No new component. One new token pair is justified: `--brand-grad-start` and `--brand-grad-end`, so the avatar-fallback/monogram gradient (currently hard-coded `#52B788 -> #1B4332` in `src/styles/home.css:13` and `src/styles/site.css:94`) follows the theme file, and no brand hex stays in component CSS. Both gradients are theme-independent.

## 1. Teal-green tint

### Direction
The current brand hue is about 152 degrees (`#52B788` dark accent and glow, `#1A7A4A` light accent, `#1B4332` gradient end). The tint moves the hue toward teal while keeping saturation and lightness, so the new colors have the same weight as today's. Neutrals (paper, black, warm greys) do not change; only the green family, the green-tinted hairlines and the glow shift. The light accent is also darkened by 2 points of lightness so that it passes 4.5:1 on `--surface-2` (today it is 4.52 there, and the pure hue shift would drop below 4.5).

### Options (human picks one)

| | Today | A: mint-teal (hue 162) | B: teal-green (hue 170, recommended) | C: strong teal (hue 178) |
|---|---|---|---|---|
| Dark `--accent`, `--accent-text`, `--glow` | #52B788 | #52B799 | #52B7A6 | #52B7B4 |
| Light `--accent`, `--accent-text`, `--brand`, `--brand-on-light` | #1A7A4A | #187257 | #187263 | #18726F |
| `--brand-on-dark` | #52B788 | #52B799 | #52B7A6 | #52B7B4 |
| `--brand-contrast` | #FFFFFF | #FFFFFF | #FFFFFF | #FFFFFF |
| Gradient start / end (`--brand-grad-start/-end`) | #52B788 / #1B4332 | #52B799 / #1B4337 | #52B7A6 / #1B433C | #52B7B4 / #1B4342 |
| Light `--border` | rgba(26,58,41,.10) | rgba(26,58,50,.10) | rgba(26,58,54,.10) | rgba(26,58,58,.10) |
| Dark `--border` | rgba(160,220,190,.12) | rgba(160,220,200,.12) | rgba(160,220,208,.12) | rgba(160,220,216,.12) |
| Dark `--ambient` | rgba(82,183,136,.16) | rgba(82,183,153,.16) | rgba(82,183,166,.16) | rgba(82,183,180,.16) |
| Light `--shadow-hover` | 0 10px 30px rgba(26,122,74,.14) | rgba(24,114,87,.14) | rgba(24,114,99,.14) | rgba(24,114,111,.14) |

Feel: A is still reads as green with a cool edge (hardly noticeable on the page); B reads as a green-teal, clearly shifted but still recognisably the same brand next to the Grove mark and old covers; C reads as teal/cyan and clashes with the unchanged `#52B788` glow in the 25 existing covers. Recommendation: B. The coder should produce a three-swatch comparison page or screenshots (hero, card hover, code block, both themes) so the human can choose from the real thing, not from hex values.

Primitives that stay the same: `--dark-*`/`--light-*` neutral palettes, `--font`, radii.

### Contrast, option B (recommended)

| Pair | Ratio | AA |
|---|---|---|
| light accent #187263 / bg #F6F5F0 | 5.31 | pass |
| light accent / surface #FFFFFF | 5.79 | pass |
| light accent / surface-2 #EEECE5 | 4.90 | pass |
| white / light accent (brand-contrast on filled) | 5.79 | pass |
| dark accent #52B7A6 / bg #000000 | 8.68 | pass |
| dark accent / surface #1E1E1B | 6.91 | pass |
| dark accent / surface-2 #242420 | 6.44 | pass |

Options A and C: A light accent #187257 gives 5.37 / 5.86 / 4.96 (bg / surface / surface-2), white on it 5.86; dark #52B799 gives 8.59 / 6.84 / 6.37. C light accent #18726F gives 5.23 / 5.71 / 4.83, white on it 5.71; dark #52B7B4 gives 8.79 / 7.00 / 6.52. All pass.

### Assets: regenerate or keep
- **Favicon family** (`public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`): the "M" gradient is the brand mark; leaving it green next to a teal site is a visible mismatch in the tab and share cards. Recommend regenerating: edit the two gradient stops in the SVG (start and end from the table), re-render the three PNG sizes with a headless-browser screenshot (render script is in git history). Cost: low, about 15 minutes, 4 files.
- **`og-image.png`** (1200x630, name, title, pills, gradient): regenerate so link previews match; recommend yes. Cost: low to medium; the source HTML is not in the repo (scratch work), so the coder rebuilds it from the current PNG and the hero text. Note that after a change, caches on social platforms keep the old image for days.
- **25 existing post covers** (`assets/images/posts/*.png`): recommend keep as is. They are dark (#050705) with a soft `#52B788` glow; the glow is a low-intensity, dark-background element, so the mismatch with option B is small, and covers are shown inside posts, not as brand chrome. Regenerating 25 requires redoing each diagram by hand (the scratch HTML is not kept) and is high cost, with a risk of changing images already cached in Grove-linked posts and social previews. Rule going forward: new covers use the new glow color (update `.agents/cover-image.md`, "Visual language", glow value and the example hex). Option C makes this mismatch obvious, which is another reason against it.
- Optional (Q4): if the human wants uniform covers anyway, do it as a separate, later task; it does not block this plan.
- `themeColorMeta` values (`#F6F5F0` / `#000000`) are neutrals and do not change.

## 2. Text contrast (`--text-3`, and `--text-2` on inset surfaces)
Today `--text-3` is 2.20:1 (light) and 2.27:1 (dark) and is used for real text: section eyebrows, post dates and meta, reading time, tag-filter counts, share label, figure captions, repo meta, footer year, placeholder text, and code comments (`--code-comment`). Separately, dark `--text-2` on `--surface-2` is 4.40:1 (fails 4.5; used in code and pills).

Fix: raise both tokens so the three-step hierarchy remains (text, text-2, text-3) and every step passes on all three surfaces (bg, surface, surface-2).

| Token | Light today | Light new | Dark today | Dark new |
|---|---|---|---|---|
| `--text-2` | #6B6862 | #5E5B55 | #8C887E | #A8A499 |
| `--text-3` | #ABA79C | #6B6862 | #4A4740 | #938F85 |

Contrast (computed, WCAG 2.x):

| Pair | Ratio | AA |
|---|---|---|
| light text-2 #5E5B55 / bg | 6.20 | pass |
| light text-2 / surface | 6.77 | pass |
| light text-2 / surface-2 | 5.72 | pass |
| light text-3 #6B6862 / bg | 5.09 | pass |
| light text-3 / surface | 5.55 | pass |
| light text-3 / surface-2 | 4.70 | pass |
| dark text-2 #A8A499 / bg | 8.44 | pass |
| dark text-2 / surface | 6.71 | pass |
| dark text-2 / surface-2 | 6.26 | pass |
| dark text-3 #938F85 / bg | 6.51 | pass |
| dark text-3 / surface | 5.18 | pass |
| dark text-3 / surface-2 | 4.83 | pass |
| light text / bg, surface, surface-2 (unchanged) | 15.08, 16.46, 13.93 | pass |
| dark text / bg, surface, surface-2 (unchanged) | 18.93, 15.06, 14.04 | pass |

Visual consequence: eyebrows, dates and captions become noticeably more legible and the hierarchy is flatter (text-3 now equals today's light text-2). To keep the quiet look, section eyebrows and meta keep their size and weight; the hierarchy is carried by size, weight and the mono font, not by faint grey. The `--code-comment` token keeps pointing at `--text-3` and now passes on `--surface-2`.
Non-text uses of `--text-3` (the `.lang-dot` fallback fill, dashed placeholder border uses `--border`) are decorative; no change needed. The decorative separators (`.repo-sep`, `.footer-sep`, colored with `--border`) stay.

## 3. Accessible names on cards (`/`)
Problem: `aria-label` on `.project-card` ("Grove — git workspace manager for macOS") and `.repo-card` ("<name> on GitHub") does not contain the visible text, so voice-control users cannot activate them by what they see (Lighthouse `label-content-name-mismatch`). The footer links were fixed in the SEO apply step.
Decision: remove `aria-label` from both card components (and from the `.project-placeholder` div, where a label on a non-interactive div has no role and is ignored by assistive tech). The accessible name then comes from the link content: for the app card, category, name, description and link text; for the repo card, name, description and meta. This is the most robust fix because the name equals the visible text by definition. No visual or copy change. The inline SVG icon keeps its own `role="img"` and label inside the app card (it is purely brand; acceptable) and the repo meta icons stay `aria-hidden`.
Acceptance: the Lighthouse audit has no label-content-name-mismatch on `/`, `/blog/` and one post; screen reader reads the card text; links remain focusable with the 2px accent focus ring.

## 4. Code blocks: one box
Cause: the Rouge-compatible markup is `div.highlighter-rouge > div.highlight > pre.highlight`; the first CSS rule gives background, border and radius to both `.highlighter-rouge` and `pre.highlight`, so the inner `pre` draws a second box inside the first. Decision: fix it (human can veto, Q5). The outer `.highlighter-rouge` keeps the box (background `--surface-2`, 1px `--border`, 12px radius, horizontal scroll). The inner `pre.highlight` keeps padding (20px; 16px under 480px) and zero margin but no border, background or radius. Where: `src/styles/post.css` (the "Code blocks" block). Net visual change: one border instead of two, inner padding unchanged, so code text does not move.
States: long lines still scroll horizontally on the outer box; focus ring on the scrollable region (if the coder adds `tabindex="0"` for keyboard scrolling, it is an improvement but out of scope); both themes, 1440px and 390px.
Related: inline code currently has a 12px radius (inherited from Jekyll). Proposed: 6px radius for inline `code`, so it reads as inline, not a pill. This is a small visible change, listed here for approval (Q5).

## 5. Non-visual hardening (security W1, W4)

### W1: mermaid
Today `src/scripts/mermaid.js` loads `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js` with no integrity. Options:
- **Recommended: bundle from npm.** Add `mermaid` as a dependency at an exact version, loaded with a dynamic `import()` in `mermaid.js`, only on pages that have a mermaid block (as today). Lock file integrity covers it, the third-party runtime origin (`cdn.jsdelivr.net`) disappears from the Pipeline profile and from the CSP surface, and no external request is made. Cost: larger `dist/` (several chunk files, loaded lazily only on the 5 diagram posts), a build-time dependency to bump by hand. Choose the latest 11.x release, not 12, to render exactly as today; moving to 12 (12.3.0 is current) is a separate visual check. Q6.
- Alternative: keep the CDN, pin the exact version in the URL and add `integrity="sha384-..."` + `crossorigin="anonymous"` to the injected script. Smaller change; keeps the CDN origin and a manual hash update on each bump.
Acceptance (either): the five mermaid posts render in light and dark and re-render on toggle; pages without diagrams make no mermaid request; no-JS fallback unchanged; with the npm option, no request to `cdn.jsdelivr.net` at all.

### W4: GitHub Actions
In `.github/workflows/deploy.yml`, pin `actions/checkout`, `actions/setup-node`, `actions/upload-pages-artifact` and `actions/deploy-pages` to full commit SHAs (keep the version tag as a trailing comment, e.g. `# v4`), and set `persist-credentials: false` on the checkout step (the build needs no git push). Keep the permissions and concurrency layout from the gate 2 fixes. Optional: a Dependabot config for `github-actions` and `npm` so SHA pins do not rot (Q7). The coder resolves SHAs from the official action repositories at release tags, not from memory.

## 6. Floating theme toggle in the kit (human decision 7: do it now)
The human overrode the designer's earlier "not now" recommendation. Spec below; it must reproduce today's site look exactly and change nothing for existing kit consumers.

### Kit change (repo `molayab/design-template-kit`, file `src/theme-toggle.css`)
Today's computed site look (kit base plus the override in `src/styles/site.css`): `position: fixed; top: 20px; right: 20px; width/height: 36px; border-radius: 10px; background: var(--surface)`; the kit's own `1px solid var(--border)`, flex centering, `color: var(--text-2)`, hover `color: var(--text)`, focus ring 2px accent with 2px offset all stay; `transition: color 0.15s, background 0.2s`; `z-index: 10`; the inner icon `svg` has `transition: transform 0.3s var(--ease)` and on hover rotates 15deg and scales 1.08.
- Add a size variable: `--theme-toggle-size`, with the kit default 34px. The base `.theme-toggle` takes `width` and `height` from it (`var(--theme-toggle-size, 34px)`), so the default render of existing consumers is byte-for-byte the same computed size.
- Add an opt-in modifier `.theme-toggle--floating`: fixed position at `top: var(--theme-toggle-offset, 20px)` and `right: var(--theme-toggle-offset, 20px)`; `--theme-toggle-size` defaults to 36px inside the modifier; `border-radius: var(--theme-toggle-radius, 10px)` (base keeps 8px); `background: var(--bg-raised, var(--surface))`; `z-index: 10`; the icon transition and the hover rotate/scale on the child `svg`. Background fallback note: the kit already defines `--bg-raised`, and the site maps it to `--surface`, so the floating variant needs no site-only token and the rendered color equals `--surface` in both themes.
- Reduced motion: inside `@media (prefers-reduced-motion: reduce)` the floating variant sets the icon and background transitions to none and cancels the hover transform (the site already collapses all transitions to ~0 globally; the kit variant must not rely on that, so it carries its own rule).
- Nothing changes without the modifier class. No selector in the base rule changes specificity, no variable is renamed, no existing declaration is removed. grove-website is therefore unaffected; the kit PR must include a note that it is opt-in and a before/after check of grove-website's computed toggle styles (34px, 8px, transparent, inline).
- Kit docs: document the modifier and the three variables (`--theme-toggle-size`, `--theme-toggle-offset`, `--theme-toggle-radius`) in the kit README, and add a changelog line.
- Version: v0.1.2 (additive, backward-compatible).

### Release sequence (pipeline agents never merge, tag or deploy)
1. Coder (agent): in a clone of the kit repo, create a branch, make the change above, run the kit's own checks, push the branch and open a PR in `molayab/design-template-kit` (the coder opens a PR only if the human's gates allow it; otherwise leaves the branch and a patch). Includes the grove-website computed-style check.
2. Human: review and merge the kit PR to the kit's default branch.
3. Human: create and push the tag `v0.1.2` on the merge commit (agents do not tag).
4. Only after the tag exists: the site PR changes `package.json` to `https://github.com/molayab/design-template-kit/archive/refs/tags/v0.1.2.tar.gz` and refreshes `package-lock.json` (`npm install`), so the lockfile records the tarball's integrity. Never point at `main`, a branch or a bare commit. Until the tag exists, the site PR stays a draft/does not merge, and the site toggle override stays untouched, so the site builds on v0.1.1 meanwhile.
5. Human: after the site PR passes review, security review (new tarball source/pin) and the gates, merge it; deploy follows the normal master workflow.
6. grove-website does not need a bump; it keeps v0.1.1 until it wants it.
If the kit tag is delayed, the site can ship all other items with the override still in place, and the toggle migration lands in a follow-up commit. This is the only reason to split the PR.

### Site changes after the kit tag exists
- `src/components/ThemeToggle.astro`: add the `theme-toggle--floating` class to the button; markup, `aria-label`, ids and the script hooks (`scripts/theme.js`, storage key `molayab-theme`) stay the same.
- `src/styles/site.css`: delete the `.theme-toggle`, `.theme-toggle svg` and `.theme-toggle:hover svg` override block (the "Theme toggle" section) completely; do not leave a partial copy. Nothing in `site.css` may set position, size, radius or background of the toggle.
- Verify: computed styles of the toggle (position, 36x36, 10px radius, background equal to `--surface`, border, z-index) are identical to the v0.1.1-plus-override build in light, dark and OS-dark; hover rotation works; reduced motion shows no transition; focus ring visible; no overlap with the site mark at 390px.
- Look impact: none intended; if the computed styles differ, the kit variant is fixed, not the look.

### Dependabot (human decision 6)
New file `.github/dependabot.yml`, `version: 2`, two ecosystems, both at the repo root directory (`/`):
- `github-actions`: weekly (Monday), one grouped PR for all actions (`groups` with pattern `*`), label `dependencies`. Dependabot understands SHA-pinned `uses:` lines with a trailing `# vX` comment: it updates the SHA and the comment together, so the W4 pins do not rot. `persist-credentials: false` and the permissions layout are not touched by it.
- `npm`: weekly (Monday), `open-pull-requests-limit: 5`, grouped: one group for `astro` and `@astrojs/*`, one group for `minor` and `patch` of everything else; major bumps arrive as separate PRs. Ignore major versions of `mermaid` (`ignore` with `update-types: version-update:semver-major`) so the 11.x decision is not silently changed; moving to 12 is a manual visual check. `package-lock.json` is updated by Dependabot.
- `design-template-kit` is a GitHub tag tarball URL, not a registry package: Dependabot's npm ecosystem cannot bump it (it neither sees newer tags nor rewrites the tarball URL). Add it to `ignore` (`dependency-name: design-template-kit`) so it never produces a broken or no-op PR. The kit is bumped by hand, through the release sequence above, with its own review.
- Dependabot PRs build via the existing PR workflow (build only, no deploy) and still need human review and merge; no auto-merge. Dependabot PRs and commits carry no AI attribution by default; nothing to add. Weekly cadence keeps noise low for a personal site.

## Design-system changes
All TODO (they change how pages look, so they were not applied before approval):
- `src/styles/theme.css`: new accent/glow/border/ambient/shadow values per the chosen option; `--text-2`, `--text-3` per section 2; add `--brand-grad-start`, `--brand-grad-end` (not theme dependent) and use them in `home.css` and `site.css` instead of hex literals.
- `src/styles/post.css`: single code box; inline code radius if approved.
- `docs/design/design-system.md`: update "Brand principles" (green becomes teal-green), "Color tokens" (new values, new gradient tokens), the contrast table (replace with section 1 and 2 tables), "Imagery" (new gradient, covers keep old glow, new covers use new one), "Accessibility" (text-3 no longer decorative-only; card names rule), "Component inventory" (project/repo cards: name from content), changelog line for this plan.
- `.agents/cover-image.md`: the glow color in "Visual language" and the example hex.
Doc edits already made in this run: none.

## AGENTS.md sections to update (after implementation)
- **Pipeline profile**: "External content origins" (drop `cdn.jsdelivr.net` if mermaid is bundled; otherwise note the pinned version and SRI); "Vendored / non-registry dependencies" see the kit pin line below; add `mermaid` as an npm dependency note if bundled.
- **The blog**, Diagrams bullet: mermaid loading (bundled dynamic import, or pinned CDN with SRI) and the "one deliberate CDN exception" wording.
- **Post cover images**, Visual language: glow value (`#52B788` becomes the chosen glow) for new covers; existing covers keep the old value.
- **What this repo is** (root-level files): `favicon.svg`, `og-image.png` notes if regenerated (colors). The `favicon` line currently says the "M" monogram "matches the Grove app icon"; after the teal change it no longer does (Grove keeps its own brand green, human decision 8), so reword it to say the mark follows the site palette and may differ from Grove's icon.
- **Pipeline profile**, "Vendored / non-registry dependencies": the kit pin moves to the v0.1.2 tag tarball; mention that Dependabot ignores it. Add `.github/dependabot.yml` to the build/CI notes.
- **Conventions** (theming): mention teal-green and the `--brand-grad-*` tokens, and that gradients live in `theme.css`.
- Hard rules and Grove contracts: unchanged.

## Accessibility & performance budget
- Contrast: every pair in the tables is at least 4.5:1 (body and small text) and accent pairs at least 4.5:1 as well, so links on surface-2 also pass; focus rings (accent) are above 3:1 against bg in both themes (5.31 light, 8.68 dark).
- Tap targets and focus order unchanged; landmarks unchanged.
- Performance: no new CSS beyond token values; with npm mermaid, lazy chunks only on diagram posts; home and blog bundles unchanged. No layout shift: no size changes.
- Reduced motion unchanged.

## Acceptance criteria
- [x] Chosen palette applied only through `theme.css` tokens; no brand hex left in `home.css`/`site.css`/components outside the avatar fallback token usage and the existing app-icon SVG fills; computed values of every token match the chosen option in light, dark and OS-dark with no `data-theme`.
- [x] Contrast table recomputed by the coder on the real computed colors: all text pairs at least 4.5:1, in both themes, on bg, surface and surface-2.
- [x] `--text-3` text (eyebrows, dates, reading time, tag counts, captions, repo meta, footer year, code comments) visibly passes; Lighthouse accessibility 100 with no color-contrast failure on `/`, `/blog/` and one post.
- [x] No `label-content-name-mismatch` on `/`; project and repo cards expose their visible text as their name.
- [x] Code blocks show one border and one background; text position unchanged; light and dark; 1440 and 390; long-line scrolling still works; inline code per the approved radius.
- [x] Favicon family and `og-image.png` regenerated with the chosen gradient (if approved); `/favicon.svg`, `/favicon-32.png`, `/apple-touch-icon.png`, `/icon-512.png`, `/og-image.png` exist at the same URLs; existing covers untouched.
- [x] Mermaid: exact version pinned (npm 11.17.2 in package.json and lockfile); diagram posts render and re-render on toggle (2 of 5 exercised in a browser, see notes); non-diagram pages make no mermaid request.
- [x] Workflow: all `uses:` pinned to full SHAs with a version comment; checkout has `persist-credentials: false`; permissions/concurrency as after gate 2; PR build passes, deploy still works on master.
- [x] Unchanged: copy, layout, URLs, `/feed.xml` (Atom, `grove` category), `/sitemap.xml`, JSON-LD, 25 posts, Grove contract (`_posts/` plus `assets/images/posts/<slug>.png`).
- [x] `docs/design/design-system.md` and AGENTS.md updated as listed; no AI attribution anywhere.

## Human decisions (2026-11-14)
1. Palette: option B, hue 170 (light accent #187263, dark accent and glow #52B7A6, gradient #52B7A6 → #1B433C, with the option B borders, ambient and shadow).
2. Assets: regenerate favicon.svg, the three favicon PNGs and og-image.png. Keep the 25 existing post covers. New covers use the new glow.
3. Contrast: raise both text-2 and text-3 as proposed. The flatter grey hierarchy is accepted.
4. W1 and W4 ship in this PR. Mermaid is bundled from npm on the 11.x line, removing the jsdelivr origin.
5. Code blocks: one box. Inline code radius goes to 6px.
6. Add Dependabot for GitHub Actions and npm.
7. The floating theme toggle moves into design-template-kit now. This overrides the designer's recommendation, so the plan needs a spec and a release sequence for it.
8. Grove (the app and grove.molayab.com) keeps its own brand green. The site may diverge from it. AGENTS.md text saying the favicon "matches the Grove app icon" must be updated.

## Open questions for the human (resolved above)
1. Palette: A (hue 162), B (hue 170, recommended) or C (hue 178)? Or a hue of your own; the coder can show a side-by-side first.
2. Regenerate favicons and `og-image.png` with the new gradient (recommended), or keep them green? Keep all 25 existing covers as they are (recommended), or regenerate them in a later task?
3. Floating theme toggle: leave as a site-side override (recommended) or move into the kit now with a v0.1.2 tag?
4. Grove's app icon and grove.molayab.com use the same green family as today. Should the teal tint be mirrored there later, or is the site allowed to drift from Grove's green?
5. Code blocks: confirm the single-box fix, and confirm inline code moves from a 12px to a 6px radius (or keep 12px).
6. Mermaid: bundle from npm (recommended) or keep the CDN with a pinned version and SRI? Stay on the 11.x line (recommended) or move to 12?
7. Add a Dependabot config for GitHub Actions and npm updates (so SHA pins stay current)?
8. Ship W1/W4 in the same PR as the palette, or as a separate non-visual PR?
9. Text contrast accepts a flatter grey hierarchy (text-3 darker/lighter than today, section 2); confirm, or ask for a different trade-off (for example only fixing the text-3 uses that carry real content and leaving the rest decorative).

## Implementation notes

Branch `astro-phase-2` (site, off master, nothing committed or pushed). Kit branch `floating-theme-toggle` (local commit `4e68a33`, not pushed, not tagged).

### Files changed (site)
- `src/styles/theme.css` (option B values, text-2/text-3, `--brand-grad-start/-end`), `home.css` and `site.css` (gradients via tokens), `post.css` (one code box, 6px inline radius).
- `src/components/ProjectCard.astro`, `RepoCard.astro`, `src/pages/index.astro`: `aria-label`s removed (the unused `label` prop and its argument too).
- `src/scripts/mermaid.js` (dynamic `import('mermaid')`), `package.json`/`package-lock.json` (`mermaid` 11.17.2, exact), `astro.config.mjs` (`chunkSizeWarningLimit: 1000` so the lazy mermaid chunks do not add a build warning).
- `.github/workflows/deploy.yml` (SHA pins: checkout v4.4.0, setup-node v4.4.0, upload-pages-artifact v3.0.1, deploy-pages v4.0.5, same majors as before; checkout `persist-credentials: false`), new `.github/dependabot.yml`.
- `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-512.png`, `og-image.png` regenerated (headless Chrome, only outputs kept). The og-image was rebuilt from the old PNG and the hero text; fonts differ slightly from the old render (system font instead of the earlier one).
- `.agents/cover-image.md`, `docs/design/design-system.md`, `AGENTS.md` updated as the plan lists.

### Kit (the local design-template-kit clone, branch `floating-theme-toggle`, v0.1.2)
`src/theme-toggle.css`: base width/height read `var(--theme-toggle-size, 34px)`; new opt-in `.theme-toggle--floating` (fixed, offset/size/radius variables, `--bg-raised` background, icon hover rotate, own reduced-motion rule). README section, CHANGELOG, `package.json` 0.1.2, `dist/` rebuilt. Diff of `dist/core.css` against v0.1.1: only the version banner, the two `var()` default lines and the appended modifier block; nothing removed or renamed. grove-website check was by diff and reasoning (its `.theme-toggle` has no modifier, so it computes 34px / 8px / transparent exactly as before); I did not build grove-website.
Floating variant against the site: built a scratch copy (outside the repo) with the local kit and the site override removed. Computed toggle styles (position, top/right, 36x36, 10px radius, background rgb(30,30,27)/#FFF, border, z-index, transitions, svg transition) are identical to the v0.1.1-plus-override build in light, dark and no-attribute states. Reduced motion: transitions collapse.
The site working tree is pinned to v0.1.1 with the override untouched, and `ThemeToggle.astro` unchanged.

### Post-tag cleanup (after the human merges the kit branch and tags v0.1.2)
1. `package.json`: kit URL to `.../refs/tags/v0.1.2.tar.gz`; `npm install` to refresh the lockfile integrity.
2. `ThemeToggle.astro`: add class `theme-toggle--floating` to the button.
3. `site.css`: delete the whole "Theme toggle" section (`.theme-toggle`, `.theme-toggle svg`, `.theme-toggle:hover svg`).
4. Re-run the computed-style comparison; update AGENTS.md ("currently v0.1.1" line) and the design-system component row.

### Verification
- Build passes, 28 pages, no warnings. Required paths exist; `/feed.xml` and `/sitemap.xml` are byte-identical to the phase-1 build; 25 posts and 26 cover files in `dist/assets/images/posts` unchanged; no `jsdelivr` string in `dist`.
- Token values confirmed in the browser (`--accent` #52b7a6 dark, text-3 #938f85).
- Contrast measured on rendered `/`, `/blog/` and a post, light and dark, transitions disabled: all text pairs at least 4.5:1 except (a) separators `.repo-sep`/`.footer-sep` (decorative, unchanged, `--border`), (b) the white "M" on the gradient avatar/site-mark fallbacks (my script cannot sample gradients; unchanged design, large text), (c) light-theme syntax token colors in code blocks (see requests).
- Lighthouse (desktop): accessibility 100 on `/`, `/blog/` and a post; `label-content-name-mismatch` and `color-contrast` pass on `/`. The only failing audit is errors-in-console from the Cloudflare analytics beacon blocked by CORS on localhost.
- Code block: text offset inside the box is unchanged (42px left, 49.5px top, same as before); inner `pre` is transparent with no radius; one box seen in light at 1440 and 390; inline code radius 6px; no horizontal page scroll.
- Mermaid: diagrams render and re-render on toggle on `mac-mini-home-server` and the QUIC post; no request to any mermaid or jsdelivr origin; a non-diagram post loads only its page script (no mermaid chunks).

### Deviations
- The inner `pre.highlight` keeps a 1px transparent border (instead of none) and `background: transparent !important` (Shiki's inline style) so code text does not move by 1px.
- The plan's three-swatch comparison was skipped; the human had already chosen B.
- `vite.build.chunkSizeWarningLimit` added (not in the plan) to keep the build warning-free.
- Pre-existing duplicated padding (`.highlight` div and `pre` both 20px, so 40px in total) left as is, since the plan says text must not move.

### Unverified
- Dark theme screenshots at 1440 and 390 were not captured (the page kept a stored light preference in the browser); dark was verified through computed colors only. Home and post were screenshotted in light at 1440/390 for the code block; the home hero at 390 only in light.
- Mermaid on 3 of the 5 diagram posts (same code path) and the toggle hover rotation.
- The workflow was not run on GitHub; SHAs were resolved with `git ls-remote` against the official repos (all lightweight tags, so the SHAs are commit SHAs).
- grove-website computed styles (see kit section).

### Requests for webpage-designer
- Light-theme syntax colors `--code-keyword` #9B4FBD, `--code-string` #C17A3D, `--code-fn` #2B79B0 measure 4.2, 2.9 and 4.0 against `--surface-2` (#EEECE5). They are pre-existing and out of this plan's scope, but they fail AA; propose darker values.
- Decide whether the double padding on code blocks (40px) is intended.

## SEO review

Gate: applied (human approved S1, S2 on 2026-11-14; applied 2026-11-14)

Apply notes:
- S1 applied: `src/plugins/rehype-a11y.mjs` sets `aria-label` on each task-list checkbox to its `<li>` text (nested lists excluded). Wired as `markdown.rehypePlugins` in `astro.config.mjs`. 3 posts affected (checkboxes labelled).
- S2 applied: same plugin turns first-column `td` of post tables into `<th scope="row">`; `post.css` adds `.post-body th[scope="row"] { color: inherit; font-weight: inherit; }` so they render like the old td (same text-align, padding, border).
- Verified (mobile Lighthouse, local static server): mac-mini-home-server, gitea-mac-mini, mac-mini-projects-ai-isolation all Accessibility 100, SEO 100, Agentic Browsing 100; Best Practices 96 (Cloudflare beacon blocked on localhost, noise).
- dist diff vs pre-change build: stylesheet hash only on all pages (the CSS file changed), plus real HTML changes on 5 posts: the 3 above and two other posts with tables (`grove-0-6-3`, `quic-pairing-and-discovery-for-a-terminal-remote`). Home, /blog/, 404, sitemap, robots unchanged apart from the CSS hash.
- `feed.xml` CHANGED: it embeds each post's rendered HTML in `<content>`, so the same `td`->`th scope=row` swap appears there for the posts with tables (18 changed lines; no task-list change since feed content has no checkboxes in changed posts beyond the above). Atom structure, titles, links, dates, categories and summaries are unchanged; the grove-website consumer reads those, not table markup.
- Files changed: `src/plugins/rehype-a11y.mjs` (new), `astro.config.mjs`, `src/styles/post.css`.
- Code changed: the security review must run on the final state before the publish gate.

Audit of the built `dist/` (28 pages) on branch `astro-phase-2`, 2026-11-14. Phase 2 introduces no SEO regression. The two items below are pre-existing accessibility findings that Lighthouse surfaces on diagram/table posts; both optional, not caused by phase 2.

| Id | Severity | Page(s) | Finding | Why it matters | Proposed change | Human decision? |
|---|---|---|---|---|---|---|
| S1 | low | `/blog/2026/07/27/mac-mini-home-server/`, `/blog/2026/07/29/gitea-mac-mini/`, `/blog/2026/08/04/mac-mini-projects-ai-isolation/` | GFM task-list `<input type="checkbox" disabled>` has no accessible name (Lighthouse `label` fails, 9 nodes; accessibility 95, `agent-accessibility-tree` fails). Identical on live phase-1 site. | Accessibility score and agent-readability; not a ranking factor. | In the markdown pipeline (`astro.config.mjs`), add a small rehype step that sets `aria-label` on each task-list checkbox to the text of its `<li>`. No post copy change. | Yes (adds a build plugin). Can be skipped. |
| S2 | low | `/blog/2026/07/27/mac-mini-home-server/` (table) | Lighthouse `td-has-header`: first column cells have no row headers. Pre-existing, same on live. | Accessibility only. | Optional: in post markdown, no change possible with GFM; or rehype step adding `scope="row"` and converting first-column `td` to `th`. Recommend skip unless S1 plugin is built. | Yes. |

No changes proposed for the phase-2 surface. Gate stays `pending` only because S1/S2 need a yes/no; if both are declined, set `Gate: not needed`.

### Checked, OK
- Built output: build passes, 28 pages. All profile URLs exist (`/`, `/blog/`, posts, `/feed.xml`, `/sitemap.xml`, `/404.html`, `/robots.txt`, `/CNAME`, favicons, `/og-image.png`, post covers).
- `/feed.xml`, `/sitemap.xml`, `/robots.txt` are byte-identical to the live phase-1 site (https://molayab.com) at audit time. Atom contract with grove-website unchanged.
- Home meta, canonical (`https://molayab.com/`, self-referencing), OG (`og:image` 1200x630 declared with alt), Twitter card, favicon/apple-touch links unchanged. All JSON-LD blocks on every built page parse; exactly one `<h1>` and an absolute molayab.com canonical on every page; 404 is `noindex`.
- `og-image.png` is 1200x630 PNG, 174,582 bytes (live: 193,233); favicons 32, 180 and 512 px as named. Filenames/URLs unchanged. Social platforms cache the old preview for days; this is expected, no action (changing the og:image URL would add churn for no gain).
- There is no web manifest in either version, so nothing to update. `theme-color` stays the neutrals `#F6F5F0` / `#000000` by the plan's decision (they are the page backgrounds, not the teal accent); not a regression.
- Mermaid: bundled by dynamic import; the home and `/blog/` HTML and their scripts contain no mermaid reference, so pages without diagrams pay nothing (the ~7 MB lazy chunks in `dist/_astro` load only on the 5 diagram posts). No jsdelivr string in `dist`. Mermaid post cover is `loading="eager" fetchpriority="high"` (correct for the LCP image).
- Lighthouse (mobile, local static server): `/` Accessibility 100, SEO 100, Best Practices 96; `/blog/` 100/100/96; mermaid post `mac-mini-home-server` Accessibility 95 (S1, S2), SEO 100, Best Practices 96. The only Best Practices failure is `errors-in-console` from the Cloudflare beacon being blocked on localhost (dev-environment noise, same as the implementer reported).
- Freshness: no copy changed in phase 2; the copyright year, versions and repo star counts were not touched and were not re-verified against GitHub (no network scrape done).

### Not checked
- Lighthouse performance (not run; mobile throttled trace not requested), desktop run, and the live deploy workflow.
- Dark-theme visuals, social-card rendering on real platforms, and the regenerated og-image's text fidelity (implementer notes fonts differ slightly; visually inspect it before merge).
- Mermaid rendering on 3 of 5 diagram posts (same code path).

## Security review

Verdict: PASS

Reviewed: 18c6b5f827c317b1b4deca2a6821606bc3956b03 on 2026-11-14 (re-review after the kit pin change; site working tree on `astro-phase-2`, kit pinned to the `v0.2.0` tag tarball). Previous: c6626fad93be0568445ef648db214f5f721a1230 (PASS).

No secrets, no PII outside the profile's intentional contacts, no exploitable code issue, no high/critical advisory, no new or unapproved non-registry dependency. The kit pin moved from v0.1.1 to v0.2.0. The tarball, the lockfile integrity and the tag all match, and the v0.1.1..v0.2.0 diff is CSS, docs and kit-repo metadata only, with no lifecycle scripts. W2 is superseded. W1 and W3 remain open low warnings for the human at the publish gate.

| # | Severity | File:line | What | Why it matters | Suggested fix |
|---|---|---|---|---|---|
| W1 | low (open) | `package-lock.json` (`node_modules/katex` 0.16.47, via `mermaid@11.17.2`) | `npm audit` (re-run): GHSA-238p-pmpm-9mq7 (low). KaTeX treats inherited `Object.prototype` props as options (`trust`). The only fix is mermaid 12.2+ (12.3.0 is current); 11.x pins katex `^0.16.47`. Same result with `--omit=dev`. | It ships to browsers, but only in the lazy chunk on the 5 diagram posts. An exploit needs a prior prototype-pollution bug plus attacker-controlled math, and diagram sources are repo-authored. Not reachable today. | Accept for now (the human chose 11.x). Clear it when moving to mermaid 12 (planned manual visual check). Do not force a katex `overrides` outside mermaid's range without testing. |
| W2 | superseded | kit branch `floating-theme-toggle` | The plan no longer releases a v0.1.2 kit. The floating toggle ships in the existing tag `v0.2.0` (`5b9ecf2`), and the site pins that tag (see "Kit pin change"). No kit PR or new tag is needed. The v0.2.0 CSS beyond the toggle was reviewed below. | n/a | None. The local `floating-theme-toggle` branch can be discarded. |
| W3 | low (open) | `.github/workflows/deploy.yml:18,22,30,51` | The SHA pins are correct but several majors behind: checkout v7.0.1, setup-node v7.1.0, upload-pages-artifact v5.0.0 and deploy-pages v5.0.1 are current. checkout, setup-node and deploy-pages v4 declare the `node20` runtime, which GitHub is retiring (exact date not checked). | The pins are byte-for-byte what `@v4`/`@v3` resolved to before, so nothing changes now. Later they could warn or break on runners. | Merge as is. Review Dependabot's grouped `actions` PR as a major change: build on the PR, then watch the first master deploy. |
| I1 | info | `src/pages/feed.xml.ts`, `sitemap.xml.ts` (carried over from phase 1) | URLs in XML are not XML-escaped. The data is repo-controlled. | Affects XML validity only, not an injection risk. | Optional: run URLs through `esc()`. |
| I2 | info | `astro.config.mjs`, `src/plugins/remark-liquid-compat.mjs` (carried over) | Raw HTML in `_posts/` renders as HTML, as kramdown did. Inbound Grove posts arrive by PR. | Human PR review is the control. | None. |
| I3 | resolved | this plan | The local absolute path with the username has been removed. A grep for `/Users/` in the plan and in the added lines finds nothing. | n/a | None. |
| I4 | info | `package-lock.json` (`node_modules/khroma`) | The lock entry has no `license` field. The package ships an MIT `license` file. | Licence inventory only. | None. |
| I5 | info | `.github/dependabot.yml` | Dependabot PRs run the `pull_request` build (`npm ci` runs dependency install scripts). The job has `contents: read`, `persist-credentials: false` and no secrets, and there is no auto-merge. Dependabot ignores the kit, so kit bumps stay manual and reviewed. | Acceptable exposure; the human merge is the control. | None. |
| I6 | info | kit v0.2.0 `dist/tokens.css`, `src/tokens.css` | v0.2.0 adds `--gutter`, `--page-max` and `--page-max-wide` tokens and a `--gutter` rule under 600px. Nothing in the site uses them. Its layout changes (`.section`, `.nav-inner`, `.footer-inner`, `.legal-inner`) live in files the site does not import (`src/styles/index.css` imports only `tokens.css` and `src/theme-toggle.css`). | No security effect. The visual impact was verified as nil by the implementer. | None. |

### Checked (this re-review)
- **Kit tag:** `git ls-remote` on `molayab/design-template-kit` shows `refs/tags/v0.2.0` is an annotated tag (`d9a0230`) that peels to `5b9ecf2545c8…`, the expected commit, which is also the current `main`. `v0.1.1` still peels to `d5df6b2`.
- **Kit tarball:** I downloaded `archive/refs/tags/v0.2.0.tar.gz` into the scratchpad. Its sha512 matches the lockfile `integrity` (`sha512-qbL+Jvzj…`) exactly. `package.json` and the lock `resolved` both point at the same `molayab/design-template-kit` tag URL (an immutable tag name, not a branch or `main`). The installed `node_modules/design-template-kit/{dist,src}` is byte-identical to the tarball.
- **Kit diff v0.1.1 to v0.2.0** (14 files): `dist/{core,foundation,tokens}.css`, `src/{footer,layout,nav,prose,theme-toggle,tokens}.css`, README, CHANGELOG, `package.json` (version only), the kit's own `.gitignore` (adds `.env*`) and its CI (adds `permissions: contents: read`). No JS file changed. `scripts` is still only `build`/`check` (no `preinstall`/`install`/`postinstall`/`prepare`). No new `@import` beyond the existing relative ones, and no `url()` to an external host. No secrets. MIT licence intact.
- **Site changes since the previous fingerprint:** only the files named in the kit pin change were modified after the SEO apply: `package.json`, `package-lock.json`, `src/components/ThemeToggle.astro`, `src/styles/site.css`, `AGENTS.md`, `docs/design/design-system.md` (and this plan). The evidence is file mtimes; every other changed file predates the previous review. The `package.json` diff is the kit URL only (mermaid is still exactly 11.17.2). The lockfile diff against `HEAD` is still the 111 mermaid additions plus the kit entry swap (version, resolved, integrity), with no other changes or removals. `ThemeToggle.astro` adds only the `theme-toggle--floating` class. `site.css` removes only the toggle override block. The AGENTS.md profile still lists the kit as the only non-registry dependency, now at v0.2.0 ("Never `main`"), so the pin is approved by the profile and the plan.
- **Secrets/attribution:** a grep over the added lines of the changed files and over the plan finds no token prefixes, keys, credentialed URLs, `/Users/` paths or AI attribution.
- **Dependencies:** `npm ls --all` is clean. `npm audit` and `npm audit --omit=dev` report only the 2 low (katex, and mermaid through it). `npm outdated` shows only mermaid 12.3.0 (a major, deliberately not taken). The kit is not covered by `npm audit` (non-registry); it was reviewed by diff above.
- **No branch history:** `git log master..HEAD` is empty; everything is uncommitted.
- Everything listed under the previous review's checks (workflow SHAs, Dependabot config, mermaid provenance, rehype-a11y escaping, image metadata, client code) was in files I confirmed unchanged since then, so those results still hold.

### Could not check
- gitleaks, trufflehog and exiftool are not installed (as before), so the secret scan was grep-based.
- "Nothing else changed" is based on file mtimes and per-file diffs. There is no saved snapshot of the previous tree to compare byte-for-byte.
- I did not rebuild the site or re-run the computed-style comparison. I relied on the implementer's note (identical computed styles in no-attribute, light and dark states; 1440 with OS dark and reduced motion were not verified).
- The workflow did not run on GitHub. The exact retirement date for node20 actions (W3) is unknown.
- Out of scope, noted only: older commits on `master` carry AI co-author trailers, against the AGENTS.md hard rule. Rewriting history is the human's call.

## Kit pin change (human-approved at gate 2, 2026-11-14)
The floating-toggle commit (`4e68a33`) is already in design-template-kit `main` and is released in tag **v0.2.0** (`5b9ecf2`, through PR #1 `layout-gutters`). No kit PR and no v0.1.2 tag are needed, so this replaces the release sequence in section 6 and the security finding W2. The human approved publishing after these steps:
1. Pin `design-template-kit` to the `v0.2.0` tag tarball in `package.json` and refresh the lockfile. Do not pin `main` or a commit.
2. Do the planned post-tag cleanup: add `theme-toggle--floating` in `ThemeToggle.astro` and remove the site's toggle override block.
3. v0.2.0 also changes `tokens.css` (it adds `--gutter`/`--page-max`) and files the site does not import. Verify that the site's computed styles and visuals are unchanged in light, dark and no-attribute states at 1440px and 390px, including the toggle.
4. Update AGENTS.md and design-system.md wherever they say v0.1.1 or v0.1.2.
5. Optional (security I3): remove the local absolute path containing the username from this plan.

### Kit pin change: implemented (2026-11-14)
`package.json` and `package-lock.json` now pin `design-template-kit` to the v0.2.0 tag tarball (`npm ci` and `npm run build` pass). `ThemeToggle.astro` uses `theme-toggle theme-toggle--floating`, and the "Theme toggle" override block was removed from `src/styles/site.css`. AGENTS.md and design-system.md now say v0.2.0, and the local path was removed from this plan. Verified against the previous build (served side by side): computed styles of every element (frame included) and of the toggle are identical in no-attribute, light and dark states at 1440 (OS light) and 390 (OS dark), with no horizontal scroll. In `dist/`, the only differences are the `Base.*.css` hash (and its link in each HTML file), the toggle CSS (kit base now uses `--theme-toggle-size`, plus the `--floating` rules and its reduced-motion rule), and the new `--gutter`/`--page-max`/`--page-max-wide` tokens with a `--gutter` rule under 600px that nothing uses; the button gains the `theme-toggle--floating` class. `npm audit` still reports only the katex low (and mermaid, which depends on it). Not verified: 1440 with OS dark and no attribute (same CSS path as dark at 390), reduced-motion emulation.
