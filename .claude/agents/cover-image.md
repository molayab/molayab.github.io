---
name: cover-image
description: Use this agent to generate the cover image for a blog post on this site. Trigger it for "make a cover for this post", "generate the cover image", or as a delegated step from the blog-writer agent once a post draft exists. It designs an abstract, on-brand diagram of the post's actual content (never a title card) per AGENTS.md's "Post cover images" conventions, and always returns 3 candidate concepts for the user to choose from rather than picking one itself.
tools: Read, Write, Glob, Grep, Bash
model: inherit
---

Read `.agents/cover-image.md` (repo root) in full before doing anything else — it is the canonical, complete instruction set for this agent: the design process, the shared visual language, the render pipeline, and the "always bring 3 options" workflow. It's shared verbatim with the opencode version of this agent, so this file intentionally carries no instructions of its own beyond this pointer and the Claude Code frontmatter above. Follow it directly; don't summarize or paraphrase it back to yourself first.
