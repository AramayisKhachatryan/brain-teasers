// Sends "New teaser" to every phone in notifications/subscriptions.json. Run by the notify job in
// .github/workflows/deploy.yml after a deploy that published new open teasers.
//
//   NEW_TEASERS='[{"slug":…,"title":…}]' VAPID_PRIVATE_KEY=… node scripts/notify.ts
import { readFileSync } from 'node:fs'
import webpush, { WebPushError } from 'web-push'
import { notificationFor, type ManifestEntry } from '../src/core/notify.ts'
import { VAPID_PUBLIC_KEY } from '../src/core/pushKey.ts'
import { openSubscription } from '../src/core/seal.ts'

interface StoredSubscription {
  person: string
  added: string
  sealed: string
}

const teasers: ManifestEntry[] = JSON.parse(process.env.NEW_TEASERS || '[]')
const privateKey = process.env.VAPID_PRIVATE_KEY
const subscriptions: StoredSubscription[] = JSON.parse(
  readFileSync(new URL('../notifications/subscriptions.json', import.meta.url), 'utf8'),
)

if (teasers.length === 0) {
  console.log('Nothing to announce.')
} else if (!privateKey) {
  console.log('::warning::The VAPID_PRIVATE_KEY secret is not set, so no notifications were sent.')
} else if (subscriptions.length === 0) {
  console.log('No phones have turned on notifications yet.')
} else {
  webpush.setVapidDetails('https://aramayiskhachatryan.github.io/brain-teasers/', VAPID_PUBLIC_KEY, privateKey)
  const message = JSON.stringify(notificationFor(teasers))
  let failed = 0
  for (const stored of subscriptions) {
    try {
      const subscription = JSON.parse(await openSubscription(stored.sealed, VAPID_PUBLIC_KEY, privateKey))
      const result = await webpush.sendNotification(subscription, message, { TTL: 24 * 60 * 60, urgency: 'normal' })
      console.log(`Sent to ${stored.person}'s phone (${result.statusCode}).`)
    } catch (error) {
      if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
        // The phone dropped this subscription (app removed, or notifications turned off): not a failure of the deploy.
        console.log(`::warning::${stored.person}'s phone no longer accepts notifications; turn them on again in the app and send the new code.`)
      } else {
        failed++
        const detail = error instanceof WebPushError ? `${error.statusCode} ${error.body}` : String(error)
        console.log(`::error::Could not notify ${stored.person}'s phone: ${detail}`)
      }
    }
  }
  if (failed > 0) process.exit(1)
}
