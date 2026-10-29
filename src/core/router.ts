// A small hash router (#/, #/calendar, #/archive, #/t/<slug>) so the app works under the GitHub Pages sub-path.
// In-app navigation uses pushState; Back/forward arrive as popstate.

export type Route = { name: 'home' } | { name: 'calendar' } | { name: 'archive' } | { name: 'teaser'; slug: string }

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '')
  if (path === '' || path === '/') return { name: 'home' }
  if (path === '/calendar') return { name: 'calendar' }
  if (path === '/archive') return { name: 'archive' }
  const teaser = /^\/t\/([a-z0-9-]+)$/.exec(path)
  if (teaser) return { name: 'teaser', slug: teaser[1] }
  return { name: 'home' }
}

export function hrefFor(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/'
    case 'calendar':
      return '#/calendar'
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
  // Each pushed entry remembers the screen it was opened from, so Back can go there and be labelled with it.
  if (options.replace) window.history.replaceState(null, '', href)
  else window.history.pushState({ from: routeKey(route) }, '', href)
  setRoute(parseHash(href), 'push')
}

/** The screen the current one was opened from in this app, or null after a direct link or a reload of the first screen. */
export function cameFrom(): Route | null {
  const from: unknown = typeof window === 'undefined' ? null : window.history.state?.from
  return typeof from === 'string' ? parseHash(from) : null
}

/** Goes back if the previous screen was in this app, otherwise to `fallback`. */
export function goBack(fallback: Route): void {
  if (cameFrom()) window.history.back()
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
