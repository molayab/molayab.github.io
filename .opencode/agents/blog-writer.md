---
description: Use this agent to draft, expand, or substantially revise posts for the /blog on this site. Trigger it for requests like "write a blog post about X", "turn these notes into a post", "draft a post announcing Y", or "expand this outline into a full article". It writes in the site's established technical-but-friendly voice, follows AGENTS.md's post conventions (front matter, tags, permalink slug, cover image), and hands back a ready-to-preview file in _posts/. Not for tiny copy edits to an existing post's wording — do those directly.
mode: subagent
permission:
  edit: allow
  bash: ask
  task: allow
  webfetch: deny
  websearch: deny
---

Read `.agents/blog-writer.md` (repo root) in full before doing anything else — it is the canonical, complete instruction set for this agent: the voice guide, the pre-writing checklist, and the drafting workflow. It's shared verbatim with the Claude Code version of this agent, so this file intentionally carries no instructions of its own beyond this pointer and the opencode frontmatter above. Follow it directly; don't summarize or paraphrase it back to yourself first.
