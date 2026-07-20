---
layout: post
title: "Grove: a Mac App for AI Coding Agents"
description: "Grove puts Claude Code, opencode, Codex, Gemini CLI, or Aider next to a real shell, file tree, and diff viewer, with full git worktree support."
date: 2026-07-20 01:00:00 -0000
tags: [grove, macos, ai-agents, developer-tools]
---

If you've adopted an AI coding agent, you've probably built a small ritual around it: one terminal tab running the agent, another for `git diff`, a Finder window or editor for the file tree, and a mental map of which one is pointed at which checkout. It works, but it's friction that has nothing to do with the actual work.

**Grove** is a native macOS app that removes that friction. It's a home for a git checkout and the tooling you use on it — agent, shell, files, and diff — kept in sync as a single unit.

## What it is

Grove organizes your work around **workspaces**: a git repository plus everything you touch while working on it. Open a workspace and you get four tabs:

- **Agent** — your CLI coding agent of choice (Claude Code, opencode, Codex, Gemini CLI, or Aider) running in a real terminal, already rooted in the right directory.
- **Shell** — an interactive login shell in that same checkout, for the commands you'd rather type yourself.
- **Files** — the checkout as an expandable tree or an icon grid, with an Open With menu to hand any file or folder straight to Xcode, VS Code, or your editor of choice.
- **Diff** — working-tree changes against `HEAD`, unified or side by side, with per-file stats, so you can see what the agent actually did without leaving the app.

A sidebar git panel handles the everyday commands — branch switching, fetch, pull, push, stage-and-commit — plus a recent-commits log, without a trip to the terminal.

## Why it's worth the switch

The detail that matters most is **git worktrees**. Grove treats a worktree as a full, independent checkout — its own branch, its own working tree — and clicking one in the sidebar redirects the *entire session* to it: agent, shell, files, and diff all follow together. That means you can point one agent at a feature branch and another at a bugfix, in separate worktrees, without either one losing track of which directory it's in or the diff view showing changes from the wrong checkout.

It also means less babysitting. Switching between workspaces doesn't kill your agent's progress — sessions and their running processes are kept alive independently of whatever tab happens to be visible, so you can check a diff, glance at the file tree, and come back to the agent mid-answer.

## How to use it

1. **Download and open Grove**, point it at a repository, and it becomes a workspace in the sidebar.
2. **Pick your agent** in Settings — Grove detects what you have installed and only offers the Agent tab when there's something to run.
3. **Work as usual.** Ask the agent for a change, watch it run in a real terminal, check the Diff tab to review what changed, and commit from the sidebar's git panel when you're happy with it.
4. **Use worktrees** for parallel work — spin one up from the sidebar to run a second agent on a different branch without touching your main checkout.

Grove doesn't add anything to what your agent can already do — no injected credentials, no hidden automation. It's the same agent, the same repository, just without four separate windows to keep synchronized.

## Get it

Grove is a one-time purchase with a 7-day free trial, distributed directly (not through the Mac App Store) — download the DMG, drag it to Applications, and on first launch right-click → Open, since it isn't yet notarized by Apple.

**[grove.molayab.com](https://grove.molayab.com)**

If you're already using an AI coding agent day to day, this is the app I built because I wanted it myself. I'd love to hear what you think — `hello@molayab.com`, or find me on X below.
