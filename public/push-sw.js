// Push notifications, loaded into the generated service worker with importScripts (see vite.config.ts).
// The Deploy workflow sends a message (scripts/notify.ts) when a new teaser is published. iOS requires a visible
// notification for every push, so one is always shown.

self.addEventListener('push', (event) => {
  let message = {}
  try {
    message = event.data ? event.data.json() : {}
  } catch {
    message = { body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(message.title || 'Brain Teasers', {
      body: message.body || '',
      tag: message.tag,
      data: { url: message.url || './' },
      icon: 'pwa-192x192.png',
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = new URL(event.notification.data?.url || './', self.registration.scope).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windows) => {
      const open = windows.find((client) => 'focus' in client)
      if (!open) return self.clients.openWindow(url)
      await open.focus()
      // Land on Home, where the new teaser is (and where the app picks up a new version).
      if (open.url !== url && 'navigate' in open) await open.navigate(url).catch(() => {})
    }),
  )
})
