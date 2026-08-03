---
layout: post
title: "Why I Built Grove"
description: "I ran tmux and git worktrees for my AI-agent workflow, and it worked fine — until it got messy and disordered. That's the actual reason Grove exists."
date: 2026-08-02 09:00:00 -0000
tags: [grove, macos, ai-agents, developer-tools]
image: /assets/images/posts/why-i-built-grove.png
---

I didn't set out to build a Mac app. I set out to fix my own workflow, because it had gotten messy.

For a while my setup was tmux plus git worktrees — a window per worktree, panes split between an agent and a shell. That's a perfectly reasonable way to work, and it held up fine right up until I had three or four worktrees going at once, each with its own agent running. Then it stopped being a workflow and turned into upkeep: which window was the feature branch, which pane still had an agent sitting there mid-answer, which session I'd renamed twice and still couldn't tell apart from the other one. Renaming things helped for about a week. After that I was back to `tmux ls`-ing my way through half-remembered names and double-checking `git status` before I trusted anything on screen.

That disordered middle is the actual trigger for Grove — not some abstract "terminals are bad" opinion, but a specific, slightly annoyed point where I stopped trying to fix it with more tmux config and started wondering if a TUI, or a raw terminal multiplexer, was even the right shape for this particular problem. What I actually wanted was windows instead of panes, and a sidebar that just shows me which worktree is which instead of a session name I have to remember to set myself.

## The first version was almost embarrassingly small

Grove's first commit is dated July 18. By July 19 it had a sidebar and something that could be called an MVP. That's not a brag about speed — it's the honest shape of how it started: a workspace list and a way to open a terminal in the right directory, built to fix my own tmux mess, not to become a product.

It became a product because the small fix kept needing one more piece. A shell tab needs a file tree next to it, or you're back to Finder. A file tree needs a diff view, or you can't tell what the agent actually did. A diff view scoped to one checkout is useless the moment you're running two agents on two worktrees, because now "the diff" is ambiguous. Each piece was a direct answer to the previous piece not being enough on its own — which is a roundabout way of saying I kept scratching the same itch until it turned into an app.

## The decisions that actually mattered

A few choices in Grove aren't obvious from the outside, and they're the ones I'd point to if you asked what the app is actually *for*:

- **A worktree switch redirects the whole session — agent, shell, files, diff, git panel — together.** Getting this right took more than one attempt. The early version let each tab track its own directory independently, which meant it was possible to commit from the main checkout while looking at a worktree's diff. That's worse than not having worktree support at all, because it's wrong in a way that looks right.
- **The Agent tab disappears entirely if you don't have an agent installed**, instead of showing an empty pane telling you to go install one. An empty state that exists just to advertise a missing feature isn't a feature, it's a nag.
- **Grove never injects credentials into the agent's environment, never passes repository contents as arguments, and never auto-runs an agent you didn't choose.** The agent pane runs whatever CLI tool you already trust, with your own environment, and that's the whole point of it — the app's job is to stay out of the way, not to add capability nobody asked for.
- **It's a native app, not a wrapped browser tab.** That's meant more `NSViewRepresentable` bridging than I'd like — a real VT100 terminal emulator, a couple of `WKWebView`s for the diff and Markdown rendering — but a coding tool that stutters or feels like a website is a coding tool I wouldn't use myself, so it wasn't a negotiable part of the build.

## Built with the thing it manages

The part I still find a little funny: Grove was built almost entirely using the same category of tool it exists to organize. The repo that builds Grove has its own small pipeline of agents — one that turns a GitHub issue into a reviewed plan, one that implements an approved plan and opens the PR, one that cuts an actual release end to end — chained together the same way you'd chain any other tool. By the time v0.3.2 shipped on August 1, that pipeline had done a meaningful share of the actual typing.

That's not a gimmick, it's the reason I trust the premise of the app. I wasn't guessing at what it's like to run multiple agents against a codebase in parallel — I was doing it every day the entire time I was building the thing meant to make it less painful.

## What I'm still not sure about

Grove is pre-revenue, built by one person, distributed as a signed-and-notarized DMG instead of through the Mac App Store — sandboxing and "run arbitrary CLI agents" don't currently coexist, so that's a real tradeoff, not a launch-day placeholder. The trial is 7 days, the license is a one-time Gumroad purchase, and I don't have a growth budget behind any of this — just the app and whoever finds it useful enough to say so.

I'm also not sure yet whether the newer, experimental parts — Notes, the on-device Chat pane — earn a permanent place, or whether they're the kind of feature that sounds good in a changelog and goes unused. I'd rather find that out from people actually using them than decide it myself in advance, which is most of why they're off by default and marked beta instead of shipped quietly as if they were settled.

If you're already juggling more than one AI coding agent across more than one branch, that's who I built this for — because I was, and still am, one of you. **[grove.molayab.com](https://grove.molayab.com)**, or `hello@molayab.com` if you want to tell me I got something wrong.
