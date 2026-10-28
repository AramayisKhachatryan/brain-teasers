import { describe, expect, it } from 'vitest'
import { daysBetween, fullDate, longDate, monthLabel, shortDate } from '../src/core/dates'

describe('dates', () => {
  it('formats teaser dates as local calendar days', () => {
    expect(longDate('2026-10-29')).toBe('Thursday 29 October')
    expect(fullDate('2026-10-29')).toBe('Thursday 29 October 2026')
    expect(shortDate('2026-10-29')).toBe('29 Oct')
    expect(monthLabel('2026-10-29')).toBe('October 2026')
  })

  it('counts whole days, across month ends and daylight saving changes', () => {
    expect(daysBetween('2026-10-22', '2026-10-22')).toBe(0)
    expect(daysBetween('2026-10-22', '2026-10-24')).toBe(2)
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2)
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3)
  })
})
