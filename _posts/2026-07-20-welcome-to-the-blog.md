---
layout: post
title: "Welcome to the blog"
description: "What this space is for, and what to expect: technical notes, release notes, and the occasional deep dive."
date: 2026-07-20
tags: [meta]
---

This is the first post on this blog — mostly a placeholder to shake out the template, but also a short note on what I want this space to be.

## What to expect

A mix of:

- **Technical notes** — things I hit while building native Swift apps for macOS and iOS, or backend services in Vapor, written down mostly so I don't re-solve them in six months.
- **Release notes** — longer-form changelogs for [Grove](https://grove.molayab.com) and other apps, when "added X, fixed Y" doesn't tell the real story.
- **Short write-ups** on patterns I keep reaching for — architecture, concurrency, tooling.

## An example

Most of my Swift work these days leans on actors for anything touching shared, mutable state. A minimal scheduler interface looks something like this:

```swift
actor TaskScheduler {
    private var queue: [ScheduledTask] = []

    func schedule(_ task: ScheduledTask) {
        queue.append(task)
        queue.sort { $0.fireDate < $1.fireDate }
    }

    func next() -> ScheduledTask? {
        queue.first
    }
}
```

Nothing exotic — the interesting part is usually in how the executor drives it, not the queue itself.

> If you want the deeper version of this pattern, `swift-background-scheduler` on [GitHub](https://github.com/molayab) is a fuller, protocol-oriented take on the same idea.

That's the template. Posts, tags, and an RSS feed all work the same way from here — `hello@molayab.com` if you want to talk about any of it.
