# Teasers

Every teaser is one markdown file in this folder: `YYYY-MM-DD-short-name.md` (the date it was given,
then a short name in lowercase letters, digits and dashes). Solving can take more than a day: the teaser stays
current until it's solved, and `solved_on` records the day we finished. The app bundles every file here at build time,
so adding or changing a file and merging it to `main` publishes it. The score is computed from these files.

## Format

```markdown
---
date: 2026-10-29
title: The two doors
status: open          # open while we're solving, solved when we're done
solved_by: []         # who solved it: [aramayis], [armen], [aramayis, armen] or []
solved_on: 2026-10-30 # optional, solved teasers only: the day we finished
---

## Problem
The full problem text.

## Hints
1. Each hint Claude gave while we were solving, in order, and who asked for it.

## Solution
The full solution, with the reasoning.

## Notes
Anything worth remembering: our approaches, wrong turns, a variant to try later.
```

## Rules (the build fails if one is broken)

- `date` is a real date, written `YYYY-MM-DD`, and matches the date in the file name.
- `title` is plain text. Wrap it in "double quotes" if it contains a colon or ` #`.
- `status` is `open` or `solved`. `solved_by` lists only `aramayis` and `armen`, each at most once.
- Sections are `## Problem`, `## Hints`, `## Solution`, `## Notes`: in that order, none empty, no others.
- **An open teaser has `solved_by: []` and only `## Problem`.** The repo is public: hints and the solution
  are added when the teaser is solved, never before.
- A solved teaser needs `## Solution`. `## Hints` and `## Notes` are optional. `solved_by: []` with
  `status: solved` means nobody got it.
- `solved_on` is optional, only for solved teasers, and can't be before `date`. The app shows how long it took
  ("a day later", "3 days").

## Scoring

Each person in `solved_by` of a solved teaser gets 1 point. Open teasers don't count.
The current teaser (shown big on Home) is the newest open one.

## Writing

- Markdown with GitHub extras: lists, **bold**, *italic*, tables, code.
- Math (KaTeX): `$x^2$` inline. The opening `$` is followed by a non-space, and the closing `$` comes right after a
  non-space and isn't followed by a digit. Display math is a block with `$$` on its own lines:

  ```markdown
  $$
  P = \frac{1}{4}
  $$
  ```

  Long display formulas scroll sideways on the phone; prefer short lines.
- Money like `$5`, `$100` or `$5/$10` stays text. If a dollar sign is ever read as math, write `\$`.
- A math mistake fails the build with the file name and the problem, so it never reaches the app.
- Hints: one numbered item per hint, ending with who asked, e.g. `*(asked by Armen)*`.
- Links open in Safari, outside the app.

Test fixtures for screenshots live in `tests/fixtures/`, never here.
