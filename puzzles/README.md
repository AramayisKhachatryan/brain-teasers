# Puzzle bank

`brainstellar.json` holds the puzzles from [BrainStellar](https://brainstellar.com/puzzles) (easy and medium)
that the daily teaser is picked from. It keeps **only the questions**: the repo is public, and the hints and
solutions would sit next to the teaser we're solving. Each entry links to its page, which has the solution.

Each puzzle has a `status`:

- `available`: can be posted.
- `used`: already a teaser (`teaser` names the file).
- `skip`: never post it (`note` says why: a repeat of one of our teasers, or a solution we've already seen).

Every morning `.github/workflows/daily-teaser.yml` runs `node scripts/daily-teaser.ts`. It picks a random
`available` puzzle, writes it as today's open teaser (Armenian date), marks it `used`, runs the tests and the
build, pushes to `main` and starts the deploy. If a teaser dated today already exists, it adds nothing.

**Days off:** a date in `days-off.json` (`{ "date": "YYYY-MM-DD", "note": "…" }`) gets no automatic teaser, for a
morning when Aramayis gives the teaser by hand. Add it before 07:35 Yerevan time that day; old entries can stay.
