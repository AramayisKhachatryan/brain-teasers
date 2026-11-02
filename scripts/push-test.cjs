// Checks the service worker's push handler (public/push-sw.js): a push from the Deploy workflow must show a
// notification with the teaser's title. Chromium's DevTools protocol hands the message straight to the
// service worker, so no push service is involved. Run with `npm run test:push` (builds, serves, checks).
const { chromium } = require('playwright')

const URL = 'http://localhost:4178/'

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  await context.grantPermissions(['notifications'], { origin: 'http://localhost:4178' })
  const page = await context.newPage()

  const cdp = await context.newCDPSession(page)
  const registrations = new Map()
  cdp.on('ServiceWorker.workerRegistrationUpdated', ({ registrations: list }) => {
    for (const r of list) registrations.set(r.scopeURL, r.registrationId)
  })
  await cdp.send('ServiceWorker.enable')

  await page.goto(URL)
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 })
  const registrationId = registrations.get(URL)
  if (!registrationId) throw new Error('no service worker registration found')

  // Headless Chromium doesn't keep shown notifications, so record what the handler asks to show.
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
  await worker.evaluate(() => {
    self.__shown = []
    const show = self.registration.showNotification.bind(self.registration)
    self.registration.showNotification = (title, options) => {
      self.__shown.push({ title, ...options })
      return show(title, options)
    }
  })

  const message = { title: 'New teaser', body: 'Witches at the coffee shop', url: './', tag: '2026-11-03-witches' }
  await cdp.send('ServiceWorker.deliverPushMessage', { origin: 'http://localhost:4178', registrationId, data: JSON.stringify(message) })

  let notifications = []
  for (let i = 0; i < 50 && notifications.length === 0; i++) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    notifications = await worker.evaluate(() => self.__shown)
  }
  console.log(JSON.stringify(notifications))
  const alive = await page.evaluate(() => document.title).then(() => true, () => false)
  await browser.close()

  const [shown] = notifications
  const ok =
    alive &&
    notifications.length === 1 &&
    shown.title === message.title &&
    shown.body === message.body &&
    shown.tag === message.tag &&
    shown.data.url === './'
  console.log(ok ? 'PASS  a push shows the "New teaser" notification' : 'FAIL  unexpected notification')
  process.exit(ok ? 0 : 1)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
