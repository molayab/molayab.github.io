# AGENTS.md

Instructions for AI coding agents (and humans) working in this repository. See `CLAUDE.md` for the full site architecture and design conventions — this file focuses on the day-to-day task of adding blog content.

## Creating a new blog post

1. Add a Markdown file to `_posts/` named `YYYY-MM-DD-slug.md` — the date must match the intended publish date, and the slug becomes part of the URL.
2. Start the file with front matter:
   ```yaml
   ---
   layout: post
   title: "Your Post Title"
   description: "One or two sentences — used as the post-card excerpt, the meta description, and social previews. Always set this explicitly."
   date: YYYY-MM-DD
   tags: [tag-one, tag-two]   # optional
   ---
   ```
3. Write the post body below the front matter in Markdown (kramdown + GFM). Start headings at `##` — the post title from front matter is already rendered as the page's `<h1>`. Fenced code blocks (\`\`\`swift, \`\`\`bash, etc.) get syntax highlighting automatically via Rouge.
4. Push to `master` (or open a PR) — GitHub Pages builds the site automatically on every push, no local build or CI step required. The post then appears at `/blog/YYYY/MM/DD/slug/`, on the `/blog/` index, and in `/feed.xml` and `/sitemap.xml`.

### Local preview (optional)

```
bundle install
bundle exec jekyll serve
```

Then visit `http://localhost:4000/blog/`. `Gemfile` pins the `github-pages` gem so local output matches what GitHub actually builds.

### Conventions to follow

- Always set `description` in front matter — nothing derives a good excerpt automatically, and it's what shows up in the post card, search results, and link previews.
- Keep tags lowercase and reuse existing ones across posts rather than inventing a new one-off tag each time.
- Don't hand-edit `/blog/index.html`'s post list, `feed.xml`, or `sitemap.xml` — they're generated from `_posts/` automatically at build time.
- The blog reuses the homepage's design tokens via `assets/css/site.css`, which is a hand-kept mirror of `index.html`'s inline `<style>` block (the homepage stays a single self-contained file on purpose, so it isn't a shared `<link>`). If you change a color token on one, update the other.
