---
layout: post
title: "A Kanban Board for AI Agents: Running a Junior Dev Team on Claude Code"
description: "How this site and Grove get built now — GitHub issues as a kanban board, Claude Code agents doing research, planning, building, and auditing, and what that used to cost versus what it costs today."
date: 2026-07-27 10:00:00 -0000
tags: [ai-agents, claude-code, workflow, grove, developer-tools]
---

Most of the commits on this site — and a growing share of the ones on [Grove](https://grove.molayab.com) — aren't typed by me. They're written by Claude Code, working off a GitHub issue, on a throwaway branch, reviewed before anything touches `master`. I didn't set out to build a "process" for this; it fell out of just trying to keep an AI agent from making a mess of a real codebase. A few months in, it looks less like "using an AI tool" and more like running a small, very literal-minded junior dev team.

## The board is just GitHub issues

No new tooling, no separate project management app — a GitHub Projects board on top of issues, moved through the usual kanban columns: **Backlog → Researching → Building → In Review → Done**. Every unit of work, whether it's "the blog's code blocks are unreadable in dark mode" or "add worktree support to the sidebar," starts life as an issue, not a prompt typed into a terminal.

That distinction matters more than it sounds. A prompt lives in one conversation and dies with it. An issue is a durable place to argue with yourself: leave a comment a day later when you notice the plan was wrong, link a screenshot, close it as a duplicate, reopen it when the "fix" didn't fix it. The agents read and write to that same record, so the history of *why* a change happened doesn't live only in a commit message — it's the whole thread, and it survives well past whichever agent session produced it.

## The loop: research → plan → build → PR → audit

Each issue moves through the same handoff, and I've come to think of it less as "prompting Claude" and more as assigning a ticket to a junior developer who happens to be extremely fast and needs everything checked:

1. **Research.** An agent reads the issue, explores the relevant code, and comes back with what it found — not a diff yet, just "here's the current behavior, here's where it lives, here's what's ambiguous about the ask." For anything non-trivial this is a comment on the issue, not silent context-gathering, so I can correct a wrong assumption before a single line of code exists.
2. **Plan.** For small fixes this collapses into the research step. For anything that touches architecture — a new Grove space, a data model change — the agent proposes an approach and waits. This is the cheapest point to catch a bad idea; redirecting a paragraph is free, redirecting a PR is not.
3. **Build.** Work happens on a disposable branch (`claude/<slug>-<id>`, never `master` directly), scoped to that one issue. This is where the "junior developer" framing earns its keep: the agent doesn't need me watching every keystroke, but it also doesn't get to decide the definition of done on its own.
4. **PR.** Opens against `develop`/`master` with a description that explains the *why*, not a restatement of the diff. If the repo has a PR template, it fills it in rather than freelancing the format.
5. **Audit.** Before anything merges, a second pass — sometimes another agent instance with a reviewer's brief instead of a builder's, sometimes me — reads the diff cold: does this actually solve the issue, did it touch something it shouldn't have, is there a simplification staring back at it. This step is non-negotiable. A junior developer who is never code-reviewed is how you end up with a codebase nobody trusts, agent-written or not.
6. **Merge**, close the issue, and whatever came up during review that's out of scope becomes its own new issue instead of scope-creeping the current PR.

This site's own history is a small, honest example of the loop: the redesign, the blog's Jekyll layout, the Grove launch posts, the icon fix that shipped alongside the `swift-ai-provider-kit` writeup — each one a separate PR, each `Co-authored-by: Claude`, each reviewed and merged rather than pushed straight to `master`. Nothing here is hypothetical; it's just how the last dozen or so commits actually happened.

## Why "junior developer" and not "autocomplete"

The mental model I started with — AI as a fancy autocomplete, finishing lines I was already typing — undersells what changes once you route work through issues instead of a chat window. A junior developer:

- Can be handed a whole ticket and trusted to come back with *something*, not just the next token.
- Still needs their PRs reviewed, because competence isn't the same as judgment about the codebase's history and intent.
- Gets better at a specific codebase the more context it accumulates about that codebase's conventions — which is exactly what a `CLAUDE.md` file, a consistent issue format, and a real commit history give it.
- Should never be the only pair of eyes on something before it ships.

Claude Code fits that shape better than it fits "autocomplete." Once I started treating it that way — assign the ticket, review the PR, don't rubber-stamp — the quality of what came back went up, mostly because I stopped accepting first drafts as final answers.

## What this used to cost

It's worth being blunt about the economics, because they're the part that actually changed. A junior developer, even a good one, is realistically **$70k–$120k a year** loaded — salary plus benefits, equipment, onboarding time, management overhead — before they've shipped anything a solo project like this one needs. Scale that to a small team of two or three to cover research, implementation, and review as separate roles, and you're well into six figures a year for exactly the loop described above: someone reads a ticket, proposes a plan, writes the code, someone else reviews it.

A Claude Pro or Max subscription runs **$20–$200 a month** depending on the tier, and covers the entire research → plan → build → audit loop for a side project plus a shipping Mac app, run by one person after hours. (GPT Plus/Pro sit in a comparable range if that's your provider of choice — the economics argument isn't Claude-specific, it's about what a subscription now buys versus what a hire used to cost.) That's not "cheaper than a junior developer" — it's a different order of magnitude, and it's the reason a single person can now run something that used to require a payroll.

The catch, and it's a real one: the subscription doesn't buy judgment. It buys throughput. The review step in the loop above isn't ceremony — it's the part that used to be a senior engineer's job, and it still is. What got cheap is the typing, the boilerplate, the first draft of a plan. What didn't get cheap, and shouldn't, is deciding whether the plan was right.

## Where this is headed

The next piece I'm building into Grove is making this loop visible inside the app itself — surfacing an issue's status, its linked branch, and its PR review state next to the workspace, instead of me tabbing over to GitHub to check where a ticket is. If the whole point is treating agents like a team you manage through a board, the tool you're already using to drive the agent should show you the board.

If you're running something similar — or thinking about it — `hello@molayab.com`, or find me on X below.
