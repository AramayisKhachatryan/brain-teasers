import { describe, expect, it } from 'vitest'
import { hrefFor, parseHash } from '../src/core/router'

describe('parseHash', () => {
  it.each([
    ['', { name: 'home' }],
    ['#', { name: 'home' }],
    ['#/', { name: 'home' }],
    ['#/calendar', { name: 'calendar' }],
    ['#/archive', { name: 'archive' }],
    ['#/archive/', { name: 'archive' }],
    ['#/t/2026-10-29-even-rolls', { name: 'teaser', slug: '2026-10-29-even-rolls' }],
    ['#/nowhere', { name: 'home' }],
  ])('%s', (hash, route) => {
    expect(parseHash(hash)).toEqual(route)
  })

  it('round-trips with hrefFor', () => {
    const route = { name: 'teaser', slug: '2026-10-29-even-rolls' } as const
    expect(parseHash(hrefFor(route))).toEqual(route)
  })
})
