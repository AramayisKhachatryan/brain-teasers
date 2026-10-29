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

What Aramayis says, and what to do:

- **"Add a new teaser: …"** / **"give us a new teaser"**: create the file with today's date, `status: open`,
  `solved_by: []` and only `## Problem`. Then commit, merge and deploy. If asked to pick, choose a
  quant-interview style or simply interesting puzzle that isn't a famous classic, and check the archive for repeats.
  **The repo is public: never put hints or the solution in the file while it's open**, not even in a commit message.
- **"Give us a hint"**: give a hint that doesn't spoil the answer, and remember it (and who asked) so it can be
  recorded later. Hints live only in the chat until the teaser is solved. If the teaser is finished in a new chat
  that doesn't know the hints, ask Aramayis for them.
- **"We're done: I solved it, Armen didn't"** (or similar): set `solved_by`, `status: solved` and `solved_on`
  (that day, in Armenian time), and add `## Hints` (the hints given, in order, with who asked; leave the section
  out if there were none), `## Solution` (full reasoning) and `## Notes` (approaches, wrong turns, "no hints").
  Then commit, merge, deploy, and report the new score.
- Math: use `$…$` and `$$…$$` (KaTeX) and keep formulas short enough to read on a phone.

## Stack and layout

Vite + React + TypeScript, vite-plugin-pwa, lucide-react, `marked` + KaTeX (at build time only), Vitest.
Node **22.22.0** (`.nvmrc`; the workflows read it). Dependencies are pinned to exact versions; keep it that way.

- `src/core/`: plain TypeScript, no React. `parse.ts` (parse + validate a teaser file, render markdown/math),
  `score.ts`, `select.ts` (current teaser = newest open; archive = everything else), `router.ts` (hash router:
  `#/`, `#/archive`, `#/t/<file-name>`), `dates.ts`, `archive.ts` (Archive search by title, solver filter
  All/Aramayis/Armen/Both where a name includes joint solves, newest/oldest order).
- `build/teasersPlugin.ts`: turns each `teasers/*.md` into a module at build time. **A malformed teaser fails the
  build**, so a typo can't break the live app. `tests/teasers.test.ts` checks every real file too.
- `src/ui/`: screens (Home, Archive, Teaser page), tab bar, folds. The Archive's search/filter/sort state lives in
  `App.tsx`, so it survives opening a teaser and coming back. `src/styles.css`: all styling and design tokens.
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
  (`sheet-*.png` put light and dark side by side). Fails on console errors or horizontal overflow.
- `npm run test:updates`: the update-flow test above.
- `npm run icons`: regenerate icons from `public/icon.svg`.

Playwright comes pre-installed in the cloud environment (`require('playwright')`); it isn't a dependency.
In screenshots, Inter stands in for the iPhone's system font.

## Git and deploy

- Claude may commit, push, pull, open pull requests and merge them into `main` without asking.
  Flow: work on a branch → PR → merge. `.github/workflows/check.yml` tests and builds every PR;
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
