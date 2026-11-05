---
layout: post
title: "Typing Untrusted Text into a Terminal from Swift"
description: 'Bracketed paste, control characters, shell quoting, and why "\r\n" is one Character — what I learned making Grove type text into a PTY without letting that text run anything.'
date: 2026-11-05 09:00:00 -0000
tags: [grove, swift, macos, security]
image: /assets/images/posts/typing-untrusted-text-into-a-terminal.png
---

[Grove](/blog/2026/07/20/introducing-grove/) types text into a terminal on your behalf: saved prompts and diff-review comments go into the agent pane, catalog commands into a shell, and along the way that text picks up code snippets from a diff, branch names, and clipboard contents. By default nothing is submitted (auto-send is opt-in), so I assumed that was safe. It isn't. A PTY's line editor interprets bytes the moment they arrive, so text that is only *typed* can still do things.

## The threat

The text comes from places I don't control: repository code, file paths, branch names, the clipboard. If any of it reaches the PTY raw:

- **`\n` or `\r`** submits the line.
- **`\x03` (Ctrl-C), `\x15` (kill line)** and friends edit or interrupt whatever is running.
- **`ESC`** starts an escape sequence — and one escape sequence matters more than the rest.

## Bracketed paste, and how to break out of it

Modern shells and TUIs turn on bracketed paste (DECSET 2004). Pasted text arrives wrapped in `ESC[200~ … ESC[201~`, and the program treats everything in between as literal text, not keystrokes. Two rules:

1. **Only wrap when the program has turned the mode on.** If it hasn't, the markers show up as literal garbage. SwiftTerm exposes this as `terminal.bracketedPasteMode`. A program that just started may not have turned it on yet, so I wait for the mode or a 5 s timeout before writing.
2. **The payload must not contain `ESC[201~`.** If it does, the paste ends early and everything after it is read as keystrokes. A string like `"foo\u{1b}[201~\recho pwned\r"` closes the paste and runs `echo pwned`. Terminal emulators usually filter this out of a user's paste, but when your app writes straight to the PTY, nothing filters it but you.

```swift
static let pasteStart: [UInt8] = [0x1b, 0x5b, 0x32, 0x30, 0x30, 0x7e] // ESC [ 200 ~
static let pasteEnd:   [UInt8] = [0x1b, 0x5b, 0x32, 0x30, 0x31, 0x7e] // ESC [ 201 ~

static func writes(text: String, submits: Bool, bracketedPaste: Bool) -> [[UInt8]] {
    var bytes = Array(text.utf8)
    if bracketedPaste, text.contains(where: \.isNewline) {
        bytes = pasteStart + bytes + pasteEnd
    }
    var writes = bytes.isEmpty ? [] : [bytes]
    if submits { writes.append([0x0d]) } // its own write, on the next main-queue turn
    return writes
}
```

The submitting `\r` goes out as a separate write on the next main-queue turn. If it shares a write with the paste, some programs read it as part of the paste and insert a newline instead of submitting.

## Sanitizing: filter Unicode scalars, not Characters

The fix for the breakout is simple: drop every control character, so ESC (U+001B) can never reach the PTY and no closing marker can ever be formed. `.control` also covers the C1 range (U+0080–U+009F), including U+009B, the 8-bit CSI — so that alternative way of starting an escape sequence is closed too.

The Swift-specific trap: `"\r\n"` is a single `Character`. Swift's `Character` is an extended grapheme cluster, and CR LF is one cluster:

```swift
"\r\n".count                  // 1
"\r\n".unicodeScalars.count   // 2
```

Filter on `Character` and you'll handle CRLF wrong or miss part of it. Iterate `unicodeScalars` and use the general category:

```swift
private static let bidiControls: Set<UInt32> = [
    0x200E, 0x200F, 0x061C, 0x202A, 0x202B, 0x202C, 0x202D, 0x202E,
    0x2066, 0x2067, 0x2068, 0x2069,
]

static func sanitized(_ value: String) -> String {
    var result = String.UnicodeScalarView()
    var previousWasCR = false
    for scalar in value.unicodeScalars {
        defer { previousWasCR = scalar == "\r" }
        switch scalar {
        case "\n" where previousWasCR:
            continue                     // CRLF → one space, not two
        case "\n", "\r", "\t":
            result.append(" ")           // a tab would trigger shell completion
        default:
            if scalar.properties.generalCategory == .control
                || bidiControls.contains(scalar.value) { continue }
            result.append(scalar)
        }
    }
    return String(result)
}
```

- **Tabs become spaces.** A raw `\t` in a shell triggers completion, so your text changes depending on what's on disk.
- **Bidi controls get dropped** (Trojan Source, CVE-2021-42574). U+202E and friends can make what you see in the terminal differ from what the shell receives. They aren't in the `.control` category, so they need their own list.

For multi-line content such as a code review, I keep the line breaks as `\n` and rely on bracketed paste. Stripping control characters still guarantees the paste can't be closed early.

## Shell quoting has its own gotchas

When a substituted value ends up in a shell command, sanitizing isn't enough — it also has to be quoted for the shell that will run it:

```swift
// POSIX (sh/bash/zsh/ksh/dash)
let posixSafe = Set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@%+=:,./_-".unicodeScalars)
if value.unicodeScalars.first != "=", value.unicodeScalars.allSatisfy(posixSafe.contains) {
    return value
}
return "'" + value.replacingOccurrences(of: "'", with: "'\\''") + "'"
```

- **zsh's `=` expansion.** With the default `EQUALS` option, a word starting with `=` expands to a command's path: `=ls` becomes `/bin/ls`. My safe set includes `=`, so I still quote when the value starts with `=`.
- **fish isn't POSIX.** Inside single quotes, fish treats `\'` and `\\` as escapes, so you escape both instead of using the `'\''` trick. I also leave `%` out of fish's safe set, because older versions expand it.
- **Unknown shells get refused.** For any other shell, a command with substitutions is refused instead of guessing its quoting rules.

## The gap I haven't closed yet

One honest caveat: if the program never enables bracketed paste, I still write after the 5 s timeout, and then each `\n` acts like Enter. Escape sequences stay blocked, but line-by-line submission doesn't. That's tracked as a Grove issue and it's the next thing I'm fixing.

## What I took away from it

- **A PTY interprets bytes even when nothing is submitted.** Treat "typed but not sent" as executed.
- **Stripping control characters is what makes bracketed paste safe.** Without it, the paste can be closed early.
- **In Swift, filter on `unicodeScalars`.** `Character` merges CRLF into one cluster.

The first one is the one that changed how I think about the feature. "Prefill, don't submit" sounded like a safety boundary, and in a terminal it simply isn't one — the boundary is whatever bytes you let through.
