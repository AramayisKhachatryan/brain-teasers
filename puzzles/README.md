# Puzzle bank

**`difficulty-ratings.md`** is Aramayis's list of 563 problems from three collections (BrainStellar, Winkler's
*Mathematical Puzzles*, Jane Street's monthly puzzles), each rated 1–10. It's an index: the problem texts live in
three companion files (`brainstellar_puzzles.md`, `winkler_puzzles.md`, `jane_street_puzzles.md`) that the
links point to.

**`brainstellar.json`** is what the morning job picks from. It keeps **only the questions** (the repo is public,
and hints or solutions would sit next to the teaser we're solving), plus each puzzle's `source`, `difficulty`
(from the ratings list) and a link to its page, which has the solution. It has all 97 BrainStellar puzzles and all
153 Jane Street monthly puzzles (`source: "janestreet"`, numbered YYYYMM; many are a grid or diagram shown as an
image from janestreet.com, and the current month's puzzle is `skip` until its solution is published).

**Winkler's 313 puzzles** are from his book, so their texts stay out of this public repo: they live in the private
repository `AramayisKhachatryan/brain-teasers-bank` (`winkler.json`). The Daily teaser workflow checks it out with
a read-only token (secret `BANK_TOKEN`) and picks from all three sources together. Only the puzzle that becomes a
teaser is published. `winkler-used.json` here lists the Winkler puzzles already used (ids only). Puzzles that need
one of the book's figures are skipped. Without the token, the job just leaves Winkler out.

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
  then a random source with puzzles in that band (BrainStellar or Winkler; Jane Street only comes in the monthly
  slot), then a random `available` puzzle from it.

It writes the teaser with the next number and its difficulty, marks the puzzle `used`, runs the tests and the
build, pushes to `main` and starts the deploy. "Give us a new teaser" in chat runs it with `--extra`.

**Days off:** a date in `days-off.json` (`{ "date": "YYYY-MM-DD", "note": "…" }`) gets no automatic teaser, for a
morning when Aramayis gives the teaser by hand. Add it before 07:05 Yerevan time that day; old entries can stay.
