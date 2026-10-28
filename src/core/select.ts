import type { Teaser } from './teaser'

/** Newest date first; on the same date, the later file name first. */
export function newestFirst(teasers: readonly Teaser[]): Teaser[] {
  return [...teasers].sort((a, b) => (a.date === b.date ? compare(b.slug, a.slug) : compare(b.date, a.date)))
}

/** The current teaser is the newest open one, or null when everything is solved. */
export function currentTeaser(teasers: readonly Teaser[]): Teaser | null {
  return newestFirst(teasers).find((teaser) => teaser.status === 'open') ?? null
}

/** Everything except the current teaser, newest first. */
export function archiveTeasers(teasers: readonly Teaser[]): Teaser[] {
  const current = currentTeaser(teasers)
  return newestFirst(teasers).filter((teaser) => teaser !== current)
}

/** The most recently solved teaser, shown on Home when nothing is open. */
export function lastSolved(teasers: readonly Teaser[]): Teaser | null {
  return newestFirst(teasers).find((teaser) => teaser.status === 'solved') ?? null
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0
}
