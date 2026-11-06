import { describe, expect, it } from 'vitest'
import { DEFAULT_VIEW, isFiltered, matchesQuery, normalize, viewArchive, type ArchiveView } from '../src/core/archive'
import { makeTeaser } from './helpers'

const teasers = [
  makeTeaser({ slug: '2026-10-22-angle', title: 'Angle-coloring game on an 8×8 board', solvedBy: ['aramayis', 'armen'] }),
  makeTeaser({ slug: '2026-10-25-drunk', title: 'Drunk airline passenger', solvedBy: ['armen'] }),
  makeTeaser({ slug: '2026-10-27-king', title: "King's salary", solvedBy: ['aramayis'] }),
  makeTeaser({ slug: '2026-10-28-nobody', title: 'Twelve coins', solvedBy: [] }),
  makeTeaser({ slug: '2026-10-29-open', title: 'Still thinking', status: 'open' }),
]
const view = (overrides: Partial<ArchiveView>) => ({ ...DEFAULT_VIEW, ...overrides })
const slugs = (list: { slug: string }[]) => list.map((teaser) => teaser.slug)

describe('search', () => {
  it('normalizes case, accents, apostrophes and the × sign', () => {
    expect(normalize("  KING'S  Salary ")).toBe('kings salary')
    expect(normalize('Ángle 8×8')).toBe('angle 8x8')
  })

  it.each([
    ['king', true],
    ['kings', true],
    ["king's salary", true],
    ['salary king', true],
    ['SALARY', true],
    ['queen', false],
  ])('"%s" in "King\'s salary": %s', (query, found) => {
    expect(matchesQuery({ number: 5, title: "King's salary" }, query)).toBe(found)
  })

  it.each([
    ['5', true],
    ['#5', true],
    ['#5 king', true],
    ['55', false],
    ['#6', false],
  ])('"%s" by number for #5 King\'s salary: %s', (query, found) => {
    expect(matchesQuery({ number: 5, title: "King's salary" }, query)).toBe(found)
  })

  it('still finds numbers inside titles', () => {
    expect(matchesQuery({ number: 1, title: 'Angle-coloring game on an 8×8 board' }, '8')).toBe(true)
  })

  it('finds 8x8 typed with a plain x', () => {
    expect(slugs(viewArchive(teasers, view({ query: '8x8' })))).toEqual(['2026-10-22-angle'])
  })

  it('shows everything for an empty or blank query', () => {
    expect(viewArchive(teasers, view({ query: '   ' }))).toHaveLength(teasers.length)
  })
})

describe('solver filter', () => {
  it('shows one person’s solves, including the ones solved together', () => {
    expect(slugs(viewArchive(teasers, view({ solver: 'aramayis' })))).toEqual(['2026-10-27-king', '2026-10-22-angle'])
    expect(slugs(viewArchive(teasers, view({ solver: 'armen' })))).toEqual(['2026-10-25-drunk', '2026-10-22-angle'])
  })

  it('shows only joint solves for "both"', () => {
    expect(slugs(viewArchive(teasers, view({ solver: 'both' })))).toEqual(['2026-10-22-angle'])
  })

  it('shows finished teasers nobody solved for "nobody", without open ones', () => {
    expect(slugs(viewArchive(teasers, view({ solver: 'nobody' })))).toEqual(['2026-10-28-nobody'])
  })

  it('combines with search', () => {
    expect(slugs(viewArchive(teasers, view({ solver: 'armen', query: 'drunk' })))).toEqual(['2026-10-25-drunk'])
    expect(viewArchive(teasers, view({ solver: 'aramayis', query: 'drunk' }))).toEqual([])
  })
})

describe('order', () => {
  it('sorts newest first by default and oldest first on request', () => {
    expect(slugs(viewArchive(teasers, DEFAULT_VIEW))[0]).toBe('2026-10-29-open')
    expect(slugs(viewArchive(teasers, view({ order: 'oldest' })))).toEqual([
      '2026-10-22-angle',
      '2026-10-25-drunk',
      '2026-10-27-king',
      '2026-10-28-nobody',
      '2026-10-29-open',
    ])
  })

  it('sorts by difficulty, newest first among equals', () => {
    const rated = [
      makeTeaser({ slug: '2026-10-01-a', difficulty: 4 }),
      makeTeaser({ slug: '2026-10-02-b', difficulty: 7 }),
      makeTeaser({ slug: '2026-10-03-c', difficulty: 4 }),
      makeTeaser({ slug: '2026-10-04-d', difficulty: 2 }),
    ]
    expect(slugs(viewArchive(rated, view({ order: 'hardest' })))).toEqual(['2026-10-02-b', '2026-10-03-c', '2026-10-01-a', '2026-10-04-d'])
    expect(slugs(viewArchive(rated, view({ order: 'easiest' })))).toEqual(['2026-10-04-d', '2026-10-03-c', '2026-10-01-a', '2026-10-02-b'])
  })

  it('does not reorder the list it was given', () => {
    const copy = [...teasers]
    viewArchive(teasers, view({ order: 'oldest' }))
    expect(teasers).toEqual(copy)
  })
})

describe('isFiltered', () => {
  it('is true only when a search or a solver filter narrows the list', () => {
    expect(isFiltered(DEFAULT_VIEW)).toBe(false)
    expect(isFiltered(view({ order: 'oldest' }))).toBe(false)
    expect(isFiltered(view({ query: ' ' }))).toBe(false)
    expect(isFiltered(view({ query: 'king' }))).toBe(true)
    expect(isFiltered(view({ solver: 'both' }))).toBe(true)
    expect(isFiltered(view({ solver: 'nobody' }))).toBe(true)
  })
})
