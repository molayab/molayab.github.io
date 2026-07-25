---
layout: post
title: "swift-ai-provider-kit: One AI Client, Any Provider"
description: "A provider-agnostic Swift package for Claude, OpenAI, and on-device Apple Intelligence — and how Grove uses it to power a lightweight, on-device Chat space."
date: 2026-07-25 12:00:00 -0000
tags: [swift, ai, macos, open-source, grove]
---

Every app that wants an AI feature eventually hits the same wall: the provider you pick today (Claude, OpenAI, whatever's next) isn't the one you'll want in a year, but by the time you notice, its request/response shapes, streaming format, and tool-calling conventions are wired straight into your app. Swapping providers means rewriting the integration, not changing a constructor argument.

**[swift-ai-provider-kit](https://github.com/molayab/swift-ai-provider-kit)** is a small, open-source (MIT) Swift package I built to avoid that trap: one abstraction, multiple backends, and app code that doesn't know or care which one is actually answering.

## The shape of it

The core type is `AIClient`, an actor that owns your tools, routes requests to whichever provider claims the model you asked for, and drives an automatic tool-execution loop when a provider comes back wanting to call something. Everything else — `AIProvider` conformances, a request builder, streaming as `AsyncThrowingStream`, conversation persistence — plugs into that one seam:

```swift
import AIProviderKit
import AppleIntelligenceProvider

guard AppleIntelligenceAvailability.isAvailable else {
    // Fall back to a remote provider, or just say so
    return
}

let client = AIClient(provider: AppleIntelligenceProvider())
let response = try await client.send(
    AIRequestBuilder()
        .model(AppleIntelligenceModel.default)
        .addMessage(.user(text: "Summarize this in one sentence."))
        .build()
)
```

Swap `AppleIntelligenceProvider()` for `ClaudeProvider(authorization: ...)` and the rest of that snippet doesn't change. Three providers ship today — Claude, OpenAI, and on-device **Apple Intelligence** via `FoundationModels` (iOS/macOS 26+) — plus tool registries, reusable prompt templates ("Recipes"), and pluggable conversation storage (in-memory today, SwiftData for anything that needs to survive a relaunch).

## Where Grove fits in

[Grove](https://grove.molayab.com) is the app I've been building this for — a native Mac app for running AI coding agents (Claude Code, opencode, Codex, and friends) against a git repository, with real worktree support so parallel branches don't fight over the same working tree.

Grove's newest space, **Chat**, is a small, early (beta, off by default) feature built directly on this package: a floating button that opens a lightweight Q&A pane backed by the on-device Apple Intelligence provider. No API key, no network round-trip, no separate credential to manage — it's the same on-device model macOS already ships, wired up through `swift-ai-provider-kit` instead of a hand-rolled `FoundationModels` integration. It's deliberately kept apart from the terminal-based Agent tab: Chat is for a quick question, not for editing your repository.

## Where it's headed

Today Chat answers from general knowledge alone. The next step is giving it the same **worktree context** Grove already tracks for everything else — so a question like "what changed in this branch" or "why is this test failing" gets answered against the actual checkout, not a guess — and wiring up custom tools so it can act on that context directly: opening a GitHub issue, pulling up a PR's status, or looking up a JIRA ticket, all still running on-device wherever the provider allows it. `swift-ai-provider-kit`'s tool-registry and skills API already have the pieces for this; the work left is Grove-side.

None of this is a Grove-only trick, either — the package is public, and I'd rather it be useful outside this one app. If you're building something that needs a provider you can swap later without a rewrite, it's on GitHub under an MIT license: **[swift-ai-provider-kit](https://github.com/molayab/swift-ai-provider-kit)**.

And if you want to see where Chat ends up first, Grove's at **[grove.molayab.com](https://grove.molayab.com)** — `hello@molayab.com` if you want to talk about either one.
