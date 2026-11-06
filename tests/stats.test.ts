import { describe, expect, it } from 'vitest'
import { computeStats, pointsTimeline } from '../src/core/stats'
import { makeTeaser } from './helpers'

const teasers = [
  makeTeaser({ slug: '2026-10-01-a', number: 1, difficulty: 5, solvedBy: ['aramayis', 'armen'], solvedOn: '2026-10-02' }),
  makeTeaser({ slug: '2026-10-02-b', number: 2, difficulty: 3, solvedBy: ['armen'] }),
  makeTeaser({ slug: '2026-10-02-c', number: 3, difficulty: 7, solvedBy: [], solvedOn: '2026-10-05', hintCount: 2 }),
  makeTeaser({ slug: '2026-10-06-d', number: 4, difficulty: 2, solvedBy: ['aramayis', 'armen'] }),
  makeTeaser({ slug: '2026-10-07-e', number: 5, difficulty: 4, solvedBy: ['aramayis'] }),
  makeTeaser({ slug: '2026-10-08-f', number: 6, difficulty: 6, status: 'open', solvedBy: [] }),
]

describe('pointsTimeline', () => {
  it('adds up difficulty points by the day each teaser was finished', () => {
    expect(pointsTimeline(teasers).map((day) => [day.date, day.points.aramayis, day.points.armen])).toEqual([
      ['2026-10-02', 5, 8], // #1 (finished on the 2nd) and #2
      ['2026-10-05', 5, 8], // #3, nobody
      ['2026-10-06', 7, 10],
      ['2026-10-07', 11, 10],
    ])
  })
})

describe('computeStats', () => {
  const stats = computeStats(teasers)

  it('counts finished, open, together and nobody', () => {
    expect(stats).toMatchObject({ finished: 5, open: 1, together: 2, nobody: 1, hints: 2 })
  })

  it('averages the days spent, counting the day given', () => {
    expect(stats.averageDays).toBe(9 / 5) // 2, 1, 4, 1, 1
  })

  it('works out each person’s numbers', () => {
    expect(stats.people.aramayis).toMatchObject({ points: 11, solved: 3, rate: 0.6, streak: 2, bestStreak: 2, solo: 1 })
    expect(stats.people.armen).toMatchObject({ points: 10, solved: 3, streak: 0, bestStreak: 2, solo: 1 })
    expect(stats.people.aramayis.hardest?.number).toBe(1)
    expect(stats.people.armen.averageDifficulty).toBeCloseTo(10 / 3)
  })

  it('splits by difficulty band', () => {
    expect(stats.bands).toEqual([
      { band: 'easy', finished: 2, solved: { aramayis: 1, armen: 2 } },
      { band: 'medium', finished: 2, solved: { aramayis: 2, armen: 1 } },
      { band: 'hard', finished: 1, solved: { aramayis: 0, armen: 0 } },
    ])
  })

  it('is all zeros with nothing finished', () => {
    const empty = computeStats([])
    expect(empty).toMatchObject({ finished: 0, averageDays: null, timeline: [] })
    expect(empty.people.armen).toMatchObject({ rate: 0, streak: 0, hardest: null, averageDifficulty: null })
  })
})
