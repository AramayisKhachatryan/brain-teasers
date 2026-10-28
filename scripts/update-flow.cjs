// Tests the update flow from CLAUDE.md ("App updates"): build version A and B, serve A with
// python3 -m http.server (localhost is a secure context, so the service worker runs), swap B's files in,
// and check that:
//   1. a first visit does not reload when the first worker takes control;
//   2. on Home, the page reloads into B by itself;
//   3. on another screen (a teaser page) it does not reload, and switches to B on going back Home.
// Run with `npm run test:updates`.
const { execSync, spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const ROOT = path.resolve(__dirname, '..')
const WORK = path.join(ROOT, '.screens/update-flow')
const SITE = path.join(WORK, 'site')
const PORT = 4174
const URL = `http://localhost:${PORT}/`

function buildVersion(version) {
  const teasers = path.join(WORK, `teasers-${version}`)
  fs.rmSync(teasers, { recursive: true, force: true })
  fs.mkdirSync(teasers, { recursive: true })
  fs.writeFileSync(
    path.join(teasers, '2026-10-01-older-one.md'),
    '---\ndate: 2026-10-01\ntitle: An older one\nstatus: solved\nsolved_by: [armen]\n---\n\n## Problem\nP\n\n## Solution\nS\n',
  )
  fs.writeFileSync(
    path.join(teasers, '2026-10-02-current.md'),
    `---\ndate: 2026-10-02\ntitle: Version ${version}\nstatus: open\nsolved_by: []\n---\n\n## Problem\nP\n`,
  )
  execSync(`npx vite build --logLevel error --outDir "${path.join(WORK, `build-${version}`)}"`, {
    cwd: ROOT,
    env: { ...process.env, TEASERS_DIR: teasers },
    stdio: 'inherit',
  })
}

/** Replaces everything the server serves, like a GitHub Pages deploy. */
function deploy(version) {
  fs.rmSync(SITE, { recursive: true, force: true })
  fs.cpSync(path.join(WORK, `build-${version}`), SITE, { recursive: true })
}

async function startServer() {
  fs.mkdirSync(SITE, { recursive: true })
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--directory', SITE], { stdio: 'ignore' })
  for (let i = 0; i < 50; i++) {
    try {
      await fetch(URL)
      return server
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  server.kill()
  throw new Error('server did not start')
}

const results = []
function check(name, ok) {
  results.push({ name, ok })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
}

async function openAppOnA(browser) {
  deploy('A')
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const page = await context.newPage()
  await page.goto(URL)
  await page.getByRole('heading', { name: 'Version A' }).waitFor()
  await page.evaluate(() => {
    window.__marker = 'same page'
  })
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 })
  await page.waitForTimeout(1000) // a reload, if one were coming, would happen now
  const kept = await page.evaluate(() => window.__marker === 'same page')
  return { context, page, kept }
}

/** What src/updates.ts does when the app comes back to the foreground: check for a new worker. */
async function resumeApp(page) {
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
}

async function main() {
  buildVersion('A')
  buildVersion('B')
  const server = await startServer()
  const browser = await chromium.launch()
  try {
    // 1 + 2: on Home, B arrives without any reload by hand.
    {
      const { context, page, kept } = await openAppOnA(browser)
      check('first visit: no reload when the first service worker takes control', kept)
      deploy('B')
      await resumeApp(page)
      const reloaded = await page
        .getByRole('heading', { name: 'Version B' })
        .waitFor({ timeout: 15000 })
        .then(() => true, () => false)
      check('on Home: reloads into version B straight away', reloaded)
      check('on Home: it was a real reload', await page.evaluate(() => window.__marker === undefined))
      await context.close()
    }

    // 3: on a teaser page, no reload; going back Home switches to B.
    {
      const { context, page } = await openAppOnA(browser)
      await page.getByRole('link', { name: 'Archive' }).tap()
      await page.getByRole('link', { name: /An older one/ }).tap()
      await page.getByRole('heading', { name: 'An older one' }).waitFor()
      await page.evaluate(() => {
        window.__changed = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.__changed = true
        })
      })
      deploy('B')
      await resumeApp(page)
      const activated = await page
        .waitForFunction(() => window.__changed === true, null, { timeout: 15000 })
        .then(() => true, () => false)
      check('on a teaser page: the new version activates in the background', activated)
      await page.waitForTimeout(1500)
      const stayed = await page.evaluate(() => window.__marker === 'same page' && location.hash.startsWith('#/t/'))
      check('on a teaser page: no reload while reading', stayed)

      await page.getByRole('button', { name: 'Archive' }).tap()
      await page.getByRole('heading', { name: 'Archive' }).waitFor()
      await page.waitForTimeout(800)
      check('back on the archive: still no reload', await page.evaluate(() => window.__marker === 'same page'))

      await page.getByRole('link', { name: 'Current' }).tap()
      const switched = await page
        .getByRole('heading', { name: 'Version B' })
        .waitFor({ timeout: 15000 })
        .then(() => true, () => false)
      check('back on Home: reloads into version B', switched)
      check('back on Home: it was a real reload', await page.evaluate(() => window.__marker === undefined))
      await context.close()
    }
  } finally {
    await browser.close()
    server.kill()
  }

  const failed = results.filter((result) => !result.ok)
  console.log(failed.length ? `\n${failed.length} check(s) failed` : '\nAll update-flow checks passed')
  process.exit(failed.length ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
