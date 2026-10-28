// A small hash router (#/, #/archive, #/t/<slug>) so the app works under the GitHub Pages sub-path.
// In-app navigation uses pushState; Back/forward arrive as popstate.

export type Route = { name: 'home' } | { name: 'archive' } | { name: 'teaser'; slug: string }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '')
  if (path === '' || path === '/') return { name: 'home' }
  if (path === '/archive') return { name: 'archive' }
  const teaser = /^\/t\/([a-z0-9-]+)$/.exec(path)
  if (teaser) return { name: 'teaser', slug: teaser[1] }
  return { name: 'home' }
}

export function hrefFor(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'archive':
      return '#/archive'
    case 'teaser':
      return `#/t/${route.slug}`
  }
}

export function routeKey(route: Route): string {
  return hrefFor(route)
}

type Listener = (route: Route) => void
const listeners = new Set<Listener>()
const beforeChange = new Set<Listener>()

let route: Route = typeof window === 'undefined' ? { name: 'home' } : parseHash(window.location.hash)
let lastKind: 'push' | 'pop' = 'pop'
let hasInAppHistory = false

export function currentRoute(): Route {
  return route
}

/** How the current route was reached: an in-app tap ('push') or Back/forward/first load ('pop'). */
export function lastNavigation(): 'push' | 'pop' {
  return lastKind
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Runs with the old route just before it changes (used to remember scroll positions). */
export function onBeforeChange(listener: Listener): () => void {
  beforeChange.add(listener)
  return () => beforeChange.delete(listener)
}

export function navigate(to: Route, options: { replace?: boolean } = {}): void {
  const href = hrefFor(to)
  if (href === routeKey(route) && !options.replace) return
  if (options.replace) window.history.replaceState(null, '', href)
  else {
    window.history.pushState(null, '', href)
    hasInAppHistory = true
  }
  setRoute(parseHash(href), 'push')
}

/** Goes back if the previous screen was in this app, otherwise to `fallback`. */
export function goBack(fallback: Route): void {
  if (hasInAppHistory) window.history.back()
  else navigate(fallback, { replace: true })
}

function setRoute(next: Route, kind: 'push' | 'pop') {
  if (routeKey(next) === routeKey(route)) return
  beforeChange.forEach((fn) => fn(route))
  route = next
  lastKind = kind
  listeners.forEach((fn) => fn(route))
}

if (typeof window !== 'undefined') {
  const sync = () => setRoute(parseHash(window.location.hash), 'pop')
  window.addEventListener('popstate', sync)
  window.addEventListener('hashchange', sync)
}
