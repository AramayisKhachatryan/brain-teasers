// Which teasers a deploy should announce, and what the notification says. No imports, so Node can run it
// directly from scripts/new-teasers.ts and scripts/notify.ts.

/** One entry of teasers.json, which every build publishes next to the app. */
export interface ManifestEntry {
  slug: string
  date: string
  title: string
  status: 'open' | 'solved'
}

/**
 * Open teasers in this build that the live site didn't have yet. Without a previous list (the very first
 * deploy that publishes one) nothing is new, so existing teasers are never announced.
 */
export function newOpenTeasers(previous: readonly ManifestEntry[] | null, current: readonly ManifestEntry[]): ManifestEntry[] {
  if (previous === null) return []
  const before = new Set(previous.map((teaser) => teaser.slug))
  return current.filter((teaser) => teaser.status === 'open' && !before.has(teaser.slug))
}

export interface PushMessage {
  title: string
  body: string
  /** Opened when the notification is tapped, relative to the app. */
  url: string
  /** Notifications with the same tag replace each other. */
  tag: string
}

export function notificationFor(teasers: readonly ManifestEntry[]): PushMessage {
  if (teasers.length === 1) return { title: 'New teaser', body: teasers[0].title, url: './', tag: teasers[0].slug }
  return {
    title: `${teasers.length} new teasers`,
    body: teasers.map((teaser) => teaser.title).join(', '),
    url: './',
    tag: teasers.map((teaser) => teaser.slug).join('+'),
  }
}
