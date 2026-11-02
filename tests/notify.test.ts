import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { newOpenTeasers, notificationFor, type ManifestEntry } from '../src/core/notify'
import { SEALED_PREFIX } from '../src/core/seal'

const entry = (slug: string, status: ManifestEntry['status'] = 'open'): ManifestEntry => ({
  slug,
  date: slug.slice(0, 10),
  title: `Title ${slug.slice(11)}`,
  status,
})

describe('newOpenTeasers', () => {
  const live = [entry('2026-11-01-a', 'solved'), entry('2026-11-02-b')]

  it('finds open teasers the live site did not have', () => {
    const built = [...live, entry('2026-11-03-c'), entry('2026-11-03-d', 'solved')]
    expect(newOpenTeasers(live, built).map((t) => t.slug)).toEqual(['2026-11-03-c'])
  })

  it('does not announce a teaser again when it is solved later', () => {
    expect(newOpenTeasers(live, [entry('2026-11-01-a', 'solved'), entry('2026-11-02-b', 'solved')])).toEqual([])
  })

  it('announces nothing on the first deploy that publishes the list', () => {
    expect(newOpenTeasers(null, [entry('2026-11-03-c')])).toEqual([])
  })
})

describe('notificationFor', () => {
  it('names the teaser', () => {
    expect(notificationFor([entry('2026-11-03-c')])).toEqual({
      title: 'New teaser',
      body: 'Title c',
      url: './',
      tag: '2026-11-03-c',
    })
  })

  it('counts several', () => {
    expect(notificationFor([entry('2026-11-03-c'), entry('2026-11-03-d')])).toMatchObject({
      title: '2 new teasers',
      body: 'Title c, Title d',
    })
  })
})

describe('notifications/subscriptions.json', () => {
  const stored = JSON.parse(readFileSync(new URL('../notifications/subscriptions.json', import.meta.url), 'utf8'))

  it('lists sealed codes only, one entry per phone', () => {
    expect(Array.isArray(stored)).toBe(true)
    for (const phone of stored) {
      expect(['aramayis', 'armen']).toContain(phone.person)
      expect(phone.added).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(phone.sealed.startsWith(SEALED_PREFIX)).toBe(true)
      expect(phone.sealed).not.toMatch(/push\.apple\.com|endpoint|auth/)
    }
  })
})
