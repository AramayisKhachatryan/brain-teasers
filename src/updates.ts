// src/updates.ts
import { currentRoute, subscribe } from './core/router' // your hash router

export function setupUpdates(): void {
  // A deploy can delete lazy chunks this page has not loaded yet. Reload into the new version.
  window.addEventListener('vite:preloadError', () => window.location.reload())

  if (!('serviceWorker' in navigator)) return
  const sw = navigator.serviceWorker

  let controller = sw.controller
  let updated = false
  const applyIfHome = () => {
    if (updated && currentRoute().name === 'home') window.location.reload()
  }

  sw.addEventListener('controllerchange', () => {
    // On a first visit the first worker claiming the page is not an update.
    if (controller) updated = true
    controller = sw.controller
    applyIfHome()
  })
  subscribe(applyIfHome) // re-check whenever the route changes

  sw.register('./sw.js', { scope: './' })
    .then((registration) => {
      // iOS resumes a Home Screen app without reloading it, so also check on resume.
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') registration.update().catch(() => {})
      })
    })
    .catch(() => {}) // no service worker in dev, or offline on a first visit
}
