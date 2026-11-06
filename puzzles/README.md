# Puzzle bank

**`difficulty-ratings.md`** is Aramayis's list of 563 problems from three collections (BrainStellar, Winkler's
*Mathematical Puzzles*, Jane Street's monthly puzzles), each rated 1–10. It's an index: the problem texts live in
three companion files (`brainstellar_puzzles.md`, `winkler_puzzles.md`, `jane_street_puzzles.md`) that the
links point to.

**`brainstellar.json`** is what the morning job picks from. It keeps **only the questions** (the repo is public,
and hints or solutions would sit next to the teaser we're solving), plus each puzzle's `source`, `difficulty`
(from the ratings list) and a link to its page, which has the solution. So far it has the 71 easy and medium
BrainStellar puzzles; Winkler and Jane Street puzzles join it (with `source: "winkler"` / `"janestreet"`) once
their texts are here.

Each puzzle has a `status`:

- `available`: can be posted.
- `used`: already a teaser (`teaser` names the file).
- `skip`: never post it (`note` says why: a repeat of one of our teasers, or a solution we've already seen).

## How the next teaser is chosen

Every morning `.github/workflows/daily-teaser.yml` runs `node scripts/daily-teaser.ts` (logic in
`src/core/daily.ts`). It adds nothing while the newest teaser is still open and inside its **days to solve**:

| Difficulty | 1–3 | 4–5 | 6 | 7 | 8 | 9–10 |
|---|---|---|---|---|---|---|
| Days | 1 | 2 | 3 | 4 | 5 | 7 |

Once that time is up (or the teaser is solved), it picks the next puzzle:

- **A Jane Street puzzle once a month:** from the 10th, if the month has none yet.
- **Mixed difficulty** otherwise: the band (easy 1–3, medium 4–5, hard 6+) seen least among the last three teasers,
  then a random `available` puzzle in it.

It writes the teaser with the next number and its difficulty, marks the puzzle `used`, runs the tests and the
build, pushes to `main` and starts the deploy. "Give us a new teaser" in chat runs it with `--extra`.

**Days off:** a date in `days-off.json` (`{ "date": "YYYY-MM-DD", "note": "…" }`) gets no automatic teaser, for a
morning when Aramayis gives the teaser by hand. Add it before 07:05 Yerevan time that day; old entries can stay.
