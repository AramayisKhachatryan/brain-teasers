// Turning on new-teaser notifications on this phone. iPhones allow web push only for apps added to the
// Home Screen (iOS 16.4+), and only right after a tap. The phone's subscription is sealed (src/core/seal.ts)
// into a code that goes into notifications/subscriptions.json.
import { NOTIFICATIONS_READY, VAPID_PUBLIC_KEY } from './core/pushKey'
import { base64urlToBytes, sealSubscription } from './core/seal'

const STATE_KEY = 'teasers.notifications'
const CODE_KEY = 'teasers.notificationCode'

export type CardState =
  | { kind: 'hidden' }
  | { kind: 'offer'; error?: string }
  | { kind: 'blocked' }
  | { kind: 'code'; code: string }

// Storage can be missing or throw (private mode); the card then simply starts over next time.
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // not remembered; harmless
  }
}

export function canUsePush(): boolean {
  return NOTIFICATIONS_READY && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

const NOT_NOW_DAYS = 3

export function initialCardState(now = Date.now()): CardState {
  if (!canUsePush()) return { kind: 'hidden' }
  const finished = read(STATE_KEY)
  if (finished === 'done') return { kind: 'hidden' }
  // "Not now" hides the card for a few days, then it comes back.
  if (finished?.startsWith('later:') && now < Number(finished.slice('later:'.length))) return { kind: 'hidden' }
  if (Notification.permission === 'denied') return { kind: 'blocked' }
  const code = read(CODE_KEY)
  if (code && Notification.permission === 'granted') return { kind: 'code', code }
  return { kind: 'offer' }
}

/** Must be called straight from a tap: iOS only shows the permission prompt then. */
export async function turnOnNotifications(): Promise<CardState> {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return permission === 'denied' ? { kind: 'blocked' } : { kind: 'offer' }
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('the app is still installing; try again')), 10_000)),
  ])
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64urlToBytes(VAPID_PUBLIC_KEY),
    }))
  const code = await sealSubscription(JSON.stringify(subscription.toJSON()), VAPID_PUBLIC_KEY)
  write(CODE_KEY, code)
  return { kind: 'code', code }
}

/** 'done' hides the card on this phone for good (code sent); 'later' hides it for a few days ("Not now"). */
export function closeCard(reason: 'done' | 'later', now = Date.now()): void {
  write(STATE_KEY, reason === 'done' ? 'done' : `later:${now + NOT_NOW_DAYS * 24 * 60 * 60 * 1000}`)
}
