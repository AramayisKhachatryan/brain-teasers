import { describe, expect, it } from 'vitest'
import {
  addMonths,
  lastDayOf,
  monthRange,
  monthWeeks,
  teasersForDay,
  todayIso,
  type CalendarDay,
} from '../src/core/calendar'
import { makeTeaser } from './helpers'

const chords = makeTeaser({ slug: '2026-10-23-chords', solvedBy: ['aramayis', 'armen'], solvedOn: '2026-10-24' })
const drunk = makeTeaser({ slug: '2026-10-25-drunk', solvedBy: ['armen'], solvedOn: '2026-10-25' })
const angle = makeTeaser({ slug: '2026-10-22-angle', solvedBy: ['aramayis', 'armen'] })
const balls = makeTeaser({ slug: '2026-10-29-balls', status: 'open', solution: null })
const teasers = [angle, chords, drunk, balls]
const TODAY = '2026-10-31'

function day(date: string, today = TODAY): CalendarDay {
  const found = monthWeeks(teasers, date.slice(0, 7), today)
    .flat()
    .find((cell) => cell?.date === date)
  if (!found) throw new Error(`no cell for ${date}`)
  return found
}

describe('month grid', () => {
  it('starts weeks on Monday and pads the edges', () => {
    const weeks = monthWeeks([], '2026-10', TODAY)
    // 1 October 2026 is a Thursday.
    expect(weeks[0].map((cell) => cell?.day ?? null)).toEqual([null, null, null, 1, 2, 3, 4])
    expect(weeks.at(-1)!.map((cell) => cell?.day ?? null)).toEqual([26, 27, 28, 29, 30, 31, null])
    expect(weeks.every((week) => week.length === 7)).toBe(true)
  })

  it('handles February and a month that starts on Monday', () => {
    expect(monthWeeks([], '2027-02', TODAY).flat().filter(Boolean)).toHaveLength(28)
    expect(monthWeeks([], '2027-02', TODAY)[0][0]?.day).toBe(1)
  })

  it('marks today', () => {
    expect(day('2026-10-31').isToday).toBe(true)
    expect(day('2026-10-30').isToday).toBe(false)
  })
})

describe('teasers on days', () => {
  it('puts a teaser on the day it was given', () => {
    expect(day('2026-10-22').given).toEqual([angle])
    expect(day('2026-10-22').span).toBeNull()
  })

  it('links the days of a teaser that took more than a day', () => {
    expect(day('2026-10-23').span).toEqual({ left: false, right: true })
    expect(day('2026-10-24').span).toEqual({ left: true, right: false })
    expect(day('2026-10-24').given).toEqual([])
    expect(day('2026-10-24').ongoing).toEqual([chords])
    expect(day('2026-10-25').span).toBeNull()
  })

  it('runs an open teaser up to today', () => {
    expect(day('2026-10-29').span).toEqual({ left: false, right: true })
    expect(day('2026-10-30').ongoing).toEqual([balls])
    expect(day('2026-10-31').span).toEqual({ left: true, right: false })
    expect(lastDayOf(balls, '2026-10-29')).toBe('2026-10-29')
  })

  it('opens the given teaser first, then the ones still being solved', () => {
    const late = makeTeaser({ slug: '2026-10-24-late', solvedBy: ['armen'], solvedOn: '2026-10-24' })
    const cell = monthWeeks([chords, late], '2026-10', TODAY)
      .flat()
      .find((c) => c?.date === '2026-10-24')!
    expect(teasersForDay(cell)).toEqual([late, chords])
    expect(teasersForDay(day('2026-10-20'))).toEqual([])
  })
})

describe('months', () => {
  it('adds months across years', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2027-01', -1)).toBe('2026-12')
    expect(addMonths('2026-10', 0)).toBe('2026-10')
  })

  it('ranges from the first teaser to today or the last teaser, whichever is later', () => {
    expect(monthRange(teasers, '2026-12-05')).toEqual({ first: '2026-10', last: '2026-12' })
    expect(monthRange(teasers, '2026-09-01')).toEqual({ first: '2026-09', last: '2026-10' })
    expect(monthRange([], '2026-11-02')).toEqual({ first: '2026-11', last: '2026-11' })
  })

  it('formats today as a local date', () => {
    expect(todayIso(new Date(2026, 9, 29, 23, 59))).toBe('2026-10-29')
    expect(todayIso(new Date(2027, 0, 5))).toBe('2027-01-05')
  })
})
