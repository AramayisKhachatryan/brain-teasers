# Brain Teasers

A web app for two friends, **Aramayis** and **Armen**: daily brain teasers (quant-interview style, or just
interesting ones) that they both try to solve, with a running score. Live at
https://aramayiskhachatryan.github.io/brain-teasers/ and installed on their iPhones and iPads from Safari
(Share → Add to Home Screen). Read-only: no login, no backend. Everything comes from `teasers/*.md`,
and Claude is the one who edits those files.

## How Aramayis works

- Aramayis does everything from an iPhone through Claude Code on the web / the Claude app. Never assume access to a computer.
  Claude does all coding, testing, committing and deploying in its cloud environment.
- Never ask Aramayis to run commands or edit files. When something needs hands-on steps (a GitHub setting, a step on the
  phone), give short tap-by-tap iPhone steps.
- The cloud environment is temporary: commit and push often.
- Aramayis only sees results on the live site. **Before merging a change to the app's look, send phone-size screenshots
  of the changed screens** (`npm run screenshots`, then send the `.screens/sheet-*-phone.png` files).
  New or updated teaser files don't need screenshots.

## Teaser workflow

The file format and validation rules are in [`teasers/README.md`](teasers/README.md). Summary:
`teasers/YYYY-MM-DD-short-name.md` (the date it was given), front matter `date`, `title`, `status`
(`open`|`solved`), `solved_by` (`[]`, `[aramayis]`, `[armen]`, `[aramayis, armen]`), optional `solved_on`
(the day they finished; solving often takes more than a day), then `## Problem`, `## Hints`, `## Solution`,
`## Notes`. Teasers #1 to #7 (22–29 Oct 2026) were imported from the list and notes Aramayis sent.

### Daily teaser (automatic, since 3 Nov 2026)

A new teaser appears every morning before 8:00 Armenian time, posted daily whether or not the previous one is
solved. `.github/workflows/daily-teaser.yml` runs at 03:35 UTC: `node scripts/daily-teaser.ts` picks a random
`available` puzzle from `puzzles/brainstellar.json` (logic in `src/core/daily.ts`), writes it as today's open teaser,
marks it `used`, runs tests and build, pushes to `main` as github-actions[bot] (no PR) and starts the Deploy
workflow. If a teaser dated today already exists, it adds nothing. It can be run by hand from the Actions tab
("Daily teaser" → Run workflow). The bank (see `puzzles/README.md`) holds questions only, never hints or
solutions; it had 64 available puzzles on 2 Nov 2026, so it runs out around early January 2027: tell Aramayis a
few weeks before, and refill it with more questions. Scheduled workflows stop after 60 days without commits.

### Notifications

When a deploy publishes a new open teaser (the morning one, or one Claude adds), each phone that turned
notifications on gets "New teaser: <title>". How it works:

- Every build publishes `teasers.json` (slug, date, title, status). `.github/workflows/deploy.yml` fetches the live one
  first, `scripts/new-teasers.ts` finds new open teasers, and after the deploy the notify job runs `scripts/notify.ts`
  (web-push) for every phone in `notifications/subscriptions.json`. Nothing is announced if the live site had no
  `teasers.json` yet, or when a teaser is only edited or solved.
- The phone side: a card on Home ("Turn on notifications", `src/ui/NotifyCard.tsx`, `src/push.ts`) asks for permission,
  subscribes with the app's public key (`src/core/pushKey.ts`), and shows a code starting with `teasers-push:`. The code is
  the subscription sealed with that public key (`src/core/seal.ts`), so it can be committed; only the private key opens it.
  "Not now" hides the card for 3 days. `public/push-sw.js` (imported into the service worker) shows the notification.
- **Setup (pending since 2 Nov 2026; Aramayis will do it later):** the private key must be saved as the GitHub secret
  `VAPID_PRIVATE_KEY` (Settings → Secrets and variables → Actions). Until then the notify job only logs a warning.
  The key was given to Aramayis in chat; if it's lost, generate a new pair (`web-push generate-vapid-keys`), replace
  `src/core/pushKey.ts`, and every phone turns notifications on again.
- **When Aramayis pastes a code** ("here is Armen's code: teasers-push:…"), add it to `notifications/subscriptions.json` as
  `{ "person": "armen", "added": "<date>", "sealed": "<code>" }` (replace that person's old entry), commit, merge.
- iPhones only allow this for the Home Screen app (iOS 16.4+). A phone that turned notifications off shows up as a
  warning in the notify job; it needs a new code.

What Aramayis says, and what to do:

- **"Add a new teaser: …"** / **"give us a new teaser"**: create the file with the date Aramayis gives (or
  today's), `status: open`, `solved_by: []` and only `## Problem`. Then commit, merge and deploy. If asked to pick,
  run `node scripts/daily-teaser.ts --extra` (a random `available` puzzle for today, marked `used`), or choose a
  quant-interview style or simply interesting puzzle that isn't a famous classic, and check the archive for repeats. **If the puzzle is in the bank,
  mark it `used`** (with `teaser`) so the daily job never posts it again; if it's too close to a bank puzzle, mark
  that one `skip` with a `note`. A teaser dated today means the daily job adds nothing that day.
  **The repo is public: never put hints or the solution in the file while it's open**, not even in a commit message.
- **"Give us a hint"**: give a hint that doesn't spoil the answer, and remember it (and who asked) so it can be
  recorded later. Hints live only in the chat until the teaser is solved. If the teaser is finished in a new chat
  that doesn't know the hints, ask Aramayis for them.
- **"We're done: I solved it, Armen didn't"** (or similar): set `solved_by`, `status: solved` and `solved_on`
  (that day, in Armenian time), and add `## Hints` (the hints given, in order, with who asked; leave the section
  out if there were none), `## Solution` (full reasoning, written by Claude) and `## Notes` (approaches, wrong
  turns, "no hints"). For a teaser from the bank, end the Notes with
  `Source: [BrainStellar #N](link)` (find it by `teaser` in `puzzles/brainstellar.json`); never link it while open,
  because the page shows the solution. Then commit, merge, deploy, and report the new score.
  With a new teaser every day, several can be open at once: Home shows the newest, and older open ones are in
  the Archive and Calendar as "Still open".
- Math: use `$…$` and `$$…$$` (KaTeX) and keep formulas short enough to read on a phone.

## Stack and layout

Vite + React + TypeScript, vite-plugin-pwa, lucide-react, `marked` + KaTeX (at build time only), Vitest.
Node **22.22.0** (`.nvmrc`; the workflows read it). Dependencies are pinned to exact versions; keep it that way.

- `src/core/`: plain TypeScript, no React. `parse.ts` (parse + validate a teaser file, render markdown/math),
  `score.ts`, `select.ts` (current teaser = newest open; archive = everything else), `router.ts` (hash router:
  `#/`, `#/calendar`, `#/archive`, `#/t/<file-name>`; each in-app navigation stores the screen it came from in
  `history.state`, which drives the teaser page's Back label and the active tab), `dates.ts`, `archive.ts`
  (Archive search by title, newest/oldest order, solver filter chips Aramayis/Armen/Both/Nobody where a
  name includes joint solves and Nobody means finished but unsolved; no chip selected shows everything, tapping
  the selected chip again clears it, and "Show all" clears search and filter), `calendar.ts` (month grid, Monday first; a teaser marks the day it was given, and its
  days until `solved_on`, or until today while open, form a "still solving" stretch).
- `build/teasersPlugin.ts`: turns each `teasers/*.md` into a module at build time. **A malformed teaser fails the
  build**, so a typo can't break the live app. `tests/teasers.test.ts` checks every real file too.
- `src/ui/`: screens (Home, Calendar, Archive, Teaser page), the tab bar (Current, Calendar, Archive), folds.
  The Archive's search/filter/sort and the Calendar's month live in `App.tsx`, so they survive opening a teaser
  and coming back. In the Calendar, tapping a day with one teaser opens it; a day with several lists them. `src/styles.css`: all styling and design tokens.
- `src/updates.ts`: service worker registration and update handling (see below).
- `public/icon.svg`: the one source icon. `npm run icons` regenerates the PNGs (`pwa-assets.config.ts`).
- `tests/fixtures/`: sample teasers for screenshots only. `TEASERS_DIR=<dir>` makes a build use them.

Design: a shared scratch notebook. Engineering-pad paper (light) / chalkboard (dark) with a faint grid; the only
accents are a red-blue editor's pencil: **blue = Aramayis, red = Armen**. Problems in Literata, chrome in the
system font. iPhone rules: `viewport-fit=cover` + `env(safe-area-inset-*)` padding, tap targets ≥ 44px, no
hover-only interactions, tappable chrome gets `.tappable` (no selection/callout, `touch-action: manipulation`),
problem text stays selectable, light/dark follows the system, `prefers-reduced-motion` respected, transitions ~260ms.
The two `theme-color` metas equal the page background (`--paper`). Use the frontend-design skill for UI work and
the webapp-testing skill for checks (`.claude/skills/`).

## App updates (important, learned the hard way)

Every new teaser is a deploy. After a deploy both phones must pick up the new version by themselves, without
reloading twice, and never while someone is reading a teaser.

- vite-plugin-pwa: `registerType: 'autoUpdate'`, `injectRegister: false`, and `workbox.skipWaiting: true` +
  `workbox.clientsClaim: true` set explicitly (with `injectRegister: false` the plugin stops setting them).
- `src/updates.ts` registers `./sw.js` itself: when a new worker takes control it reloads only on Home, otherwise
  on the next return to Home; it checks for updates whenever the app comes back to the foreground (iOS resumes
  Home Screen apps without reloading). It also reloads on `vite:preloadError`.
- **Never use `prompt` mode or anything that makes a new service worker wait.** An older page has no code to
  release a waiting worker, and iOS doesn't reliably activate it when the app is closed.
- `npm run test:updates` builds version A and B, serves A with `python3 -m http.server`, swaps B in and checks
  with Playwright: no reload on first visit, immediate reload into B on Home, no reload on a teaser page, switch
  to B on going back Home. Run it after any change to updates, the router or the PWA config.

## Commands

- `npm test`: unit tests + validation of every teaser file.
- `npm run build`: typecheck + production build into `dist/` (fails on a malformed teaser).
- `npm run screenshots`: real app + fixtures at 390×844, 820×1180 and 1180×820, light and dark, into `.screens/`
  (`sheet-*.png` put light and dark side by side). "Today" is fixed at 30 Oct 2026 so the Calendar shots are
  reproducible. Fails on console errors or horizontal overflow.
- `npm run test:updates`: the update-flow test above.
- `npm run test:push`: checks that a push makes the service worker show the "New teaser" notification.
- `npm run icons`: regenerate icons from `public/icon.svg`.

Playwright comes pre-installed in the cloud environment (`require('playwright')`); it isn't a dependency.
In screenshots, Inter stands in for the iPhone's system font.

## Git and deploy

- Claude may commit, push, pull, open pull requests and merge them into `main` without asking.
  Flow: work on a branch → PR → merge (only the daily-teaser workflow pushes to `main` directly).
  `.github/workflows/check.yml` tests and builds every PR;
  `.github/workflows/deploy.yml` tests, builds and deploys to GitHub Pages on every push to `main`.
- **Deleting is fine when needed** (files, code, features, merged branches), as long as it stays recoverable
  from git: delete through normal commits.
- **Never do what git can't undo**: no force-push or history rewriting, no deleting branches with unmerged work,
  no deleting the repo. Ask before creating a new remote repo.
- After merging, watch the "Deploy" Actions run until it's green, then say it's live (the live site may not
  be reachable from the cloud session, so use the Actions status).
- After each deploy, say what to do on the phone. Normally nothing: open the app and it updates on the
  main screen.
- GitHub Pages: Settings → Pages → Source must be "GitHub Actions". The repo must stay public (free plan).
