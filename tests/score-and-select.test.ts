import { describe, expect, it } from 'vitest'
import { computeScore } from '../src/core/score'
import { archiveTeasers, currentTeaser, lastSolved, newestFirst } from '../src/core/select'
import { makeTeaser } from './helpers'

describe('computeScore', () => {
  it('starts at zero', () => {
    expect(computeScore([])).toEqual({ aramayis: 0, armen: 0 })
  })

  it('gives each solver a point and both a point when both solve', () => {
    const teasers = [
      makeTeaser({ slug: '2026-10-01-a', solvedBy: ['aramayis'] }),
      makeTeaser({ slug: '2026-10-02-b', solvedBy: ['armen'] }),
      makeTeaser({ slug: '2026-10-03-c', solvedBy: ['aramayis', 'armen'] }),
      makeTeaser({ slug: '2026-10-04-d', solvedBy: [] }),
    ]
    expect(computeScore(teasers)).toEqual({ aramayis: 2, armen: 2 })
  })

  it('ignores open teasers', () => {
    const teasers = [makeTeaser({ slug: '2026-10-01-a', status: 'open', solvedBy: ['armen'] })]
    expect(computeScore(teasers)).toEqual({ aramayis: 0, armen: 0 })
  })
})

describe('selection', () => {
  const older = makeTeaser({ slug: '2026-10-01-older', status: 'open' })
  const solved = makeTeaser({ slug: '2026-10-02-solved', solvedBy: ['armen'] })
  const newest = makeTeaser({ slug: '2026-10-03-newest', status: 'open' })
  const sameDayLater = makeTeaser({ slug: '2026-10-02-zeta', solvedBy: [] })

  it('sorts newest first, then by file name on the same day', () => {
    expect(newestFirst([older, solved, newest, sameDayLater]).map((t) => t.slug)).toEqual([
      '2026-10-03-newest',
      '2026-10-02-zeta',
      '2026-10-02-solved',
      '2026-10-01-older',
    ])
  })

  it('on the same day, puts the higher number first, whatever the file names', () => {
    const first = makeTeaser({ slug: '2026-11-02-splitting-stones', number: 9 })
    const second = makeTeaser({ slug: '2026-11-02-pattern-on-snowflakes', number: 10, status: 'open' })
    expect(newestFirst([first, second]).map((t) => t.number)).toEqual([10, 9])
    expect(currentTeaser([first, second])).toBe(second)
  })

  it('picks the newest open teaser as current', () => {
    expect(currentTeaser([older, solved, newest])).toBe(newest)
  })

  it('has no current teaser when everything is solved', () => {
    expect(currentTeaser([solved])).toBeNull()
  })

  it('puts everything but the current teaser in the archive', () => {
    expect(archiveTeasers([older, solved, newest]).map((t) => t.slug)).toEqual([
      '2026-10-02-solved',
      '2026-10-01-older',
    ])
  })

  it('finds the last solved teaser', () => {
    expect(lastSolved([older, solved, newest, sameDayLater])).toBe(sameDayLater)
    expect(lastSolved([older])).toBeNull()
  })
})
