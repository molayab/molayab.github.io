---
layout: post
title: "Getting Grove Notarized by Apple"
description: "We've started the process to get Grove notarized by Apple. A short explainer on what notarization actually means, and what changes for you."
date: 2026-07-20 02:00:00 -0000
tags: [grove, macos, security]
---

If you've downloaded Grove already, you've hit this: open the DMG, drag Grove to Applications, launch it, and macOS throws up a warning about an "unidentified developer" before it'll let you in. You have to right-click the app and choose Open instead of just double-clicking. That's expected for an app distributed outside the Mac App Store the way Grove currently is, but it's not a great first impression — so we've started the process to fix it: Grove is now enrolled to be **notarized** by Apple.

## What notarization actually is

Notarization is not the same thing as an App Store review, and it doesn't mean Apple approves of what your app does. It's a narrower, automated check: you submit a signed build to Apple, their systems scan it for known malware and unsafe coding practices, and — assuming it's clean — Apple attaches a "notary ticket" to it. macOS's Gatekeeper checks for that ticket the first time you open the app and, if it's there, lets it launch without the scary warning. No human reviews your code, no functionality restrictions apply; it's a security stamp, not a content judgment.

## Why it matters

Right now, "right-click → Open" is a small piece of friction, but it's also exactly the kind of instruction that phishing pages tell people to follow to get past a warning macOS put there on purpose — so asking legitimate users to do it isn't great practice, even for a small indie app. Notarization removes the warning entirely for a legitimately signed build, which means:

- **A normal first launch** — double-click and go, no workaround to explain in a README.
- **More trust**, especially for anyone installing developer tooling that runs shell commands and AI agents against their own repositories, where "is this actually safe to run" is a fair question to ask before installing.
- **No change to how Grove works** — notarization doesn't touch sandboxing, entitlements, or what the app can do. Grove stays exactly as capable (and exactly as unsandboxed, since that's what running arbitrary CLI agents requires).

## How it works, briefly

Getting there requires three things: enrollment in the Apple Developer Program, a Developer ID Application certificate to sign release builds with (replacing the ad-hoc signing Grove uses today), and a submission step where each release build is sent to Apple's notary service before it's published — Apple's scan typically takes minutes, and the resulting ticket gets "stapled" to the app so Gatekeeper can verify it even offline.

## Where things stand

Enrollment is underway. Until it's complete, releases still ship ad-hoc signed, and the right-click → Open step is still necessary — we'd rather tell you that plainly than pretend it's already fixed. Once the certificate is in place, the notarization step gets added to the release pipeline and future versions of Grove install the way every other properly distributed Mac app does.

**[grove.molayab.com](https://grove.molayab.com)** — thanks for bearing with the extra click in the meantime.
