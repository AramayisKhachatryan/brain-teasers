// Phone and iPad screenshots of every screen, light and dark (webapp-testing skill pattern).
// Run through `npm run screenshots`, which builds and serves .screens/builds/ on port 4173.
// Fails on console errors or horizontal overflow. Output: .screens/*.png and contact sheets.
const { chromium } = require('playwright')
const path = require('node:path')

const BASE = 'http://localhost:4173'
// "Today" in every screenshot, so the Calendar (today's month, the open teaser's stretch) is reproducible.
const TODAY = new Date('2026-10-30T12:00:00')
const OUT = path.resolve(__dirname, '../.screens')

const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  'ipad-portrait': { width: 820, height: 1180 },
  'ipad-landscape': { width: 1180, height: 820 },
}

const SHOTS = [
  { name: 'home', build: 'real', hash: '#/' },
  { name: 'archive-real', build: 'real', hash: '#/archive' },
  { name: 'archive-search', build: 'real', hash: '#/archive', search: 'king' },
  { name: 'archive-both-oldest', build: 'real', hash: '#/archive', taps: [['radio', 'Both'], ['button', 'Sorted Newest first']] },
  { name: 'archive-no-match', build: 'real', hash: '#/archive', search: 'pirates', taps: [['radio', 'Armen']] },
  { name: 'teaser-real', build: 'real', hash: '#/t/2026-10-23-circle-chords' },
  { name: 'teaser-real-unfolded', build: 'real', hash: '#/t/2026-10-27-kings-salary', open: ['Solution'], fullPage: true },
  { name: 'home-nothing-open', build: 'all-solved', hash: '#/' },
  { name: 'calendar', build: 'real', hash: '#/calendar' },
  { name: 'calendar-two-on-a-day', build: 'screens', hash: '#/calendar', taps: [['button', /^Wednesday 21 October/]] },
  { name: 'teaser-from-calendar', build: 'real', hash: '#/calendar', taps: [['button', /^Saturday 24 October/]] },
  { name: 'archive', build: 'screens', hash: '#/archive' },
  { name: 'teaser', build: 'screens', hash: '#/t/2026-10-27-broken-stick' },
  { name: 'teaser-unfolded', build: 'screens', hash: '#/t/2026-10-27-broken-stick', open: ['Hints', 'Solution'], fullPage: true },
]

async function main() {
  const browser = await chromium.launch()
  const problems = []
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    for (const colorScheme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme,
        serviceWorkers: 'block',
      })
      for (const shot of SHOTS) {
        const page = await context.newPage()
        page.on('console', (msg) => msg.type() === 'error' && problems.push(`${shot.name}: ${msg.text()}`))
        page.on('pageerror', (err) => problems.push(`${shot.name}: ${err.message}`))
        await page.clock.setFixedTime(TODAY)
        await page.goto(`${BASE}/${shot.build}/index.html${shot.hash}`)
        await page.waitForLoadState('networkidle')
        await page.evaluate(() => document.fonts.ready)
        for (const label of shot.open ?? []) {
          await page.getByRole('button', { name: label }).tap() // a tap, like a finger: no hover state
        }
        for (const [role, name] of shot.taps ?? []) {
          await page.getByRole(role, typeof name === 'string' ? { name, exact: true } : { name }).tap()
        }
        if (shot.search) {
          await page.getByRole('searchbox', { name: 'Search titles' }).fill(shot.search)
          await page.keyboard.press('Enter') // the Search key closes the keyboard
        }
        await page.waitForTimeout(450) // screen fade and fold transitions (260ms)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
        if (overflow > 0) problems.push(`${shot.name} ${viewportName}: ${overflow}px horizontal overflow`)
        if (shot.fullPage) {
          // A tall viewport rather than fullPage, so the fixed tab bar stays at the bottom.
          const height = await page.evaluate(() => document.documentElement.scrollHeight)
          await page.setViewportSize({ width: viewport.width, height: Math.max(height, viewport.height) })
          await page.waitForTimeout(100)
        }
        await page.screenshot({ path: `${OUT}/${shot.name}-${viewportName}-${colorScheme}.png` })
        await page.close()
      }
      await context.close()
    }
  }
  await browser.close()
  await contactSheets()
  if (problems.length) {
    console.error('Problems:\n' + problems.join('\n'))
    process.exit(1)
  }
  console.log(`Screenshots in ${OUT}`)
}

// Light and dark side by side, one sheet per screen and device, so they are easy to review on a phone.
async function contactSheets() {
  const sharp = require('sharp')
  for (const shot of SHOTS) {
    for (const viewportName of Object.keys(VIEWPORTS)) {
      const files = ['light', 'dark'].map((scheme) => `${OUT}/${shot.name}-${viewportName}-${scheme}.png`)
      const metas = await Promise.all(files.map((file) => sharp(file).metadata()))
      const gap = 40
      const width = metas[0].width + metas[1].width + gap
      const height = Math.max(metas[0].height, metas[1].height)
      await sharp({ create: { width, height, channels: 3, background: '#8a8f8b' } })
        .composite([
          { input: files[0], left: 0, top: 0 },
          { input: files[1], left: metas[0].width + gap, top: 0 },
        ])
        .png()
        .toFile(`${OUT}/sheet-${shot.name}-${viewportName}.png`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
