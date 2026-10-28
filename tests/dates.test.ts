import { describe, expect, it } from 'vitest'
import { fullDate, longDate, monthLabel, shortDate } from '../src/core/dates'

describe('dates', () => {
  it('formats teaser dates as local calendar days', () => {
    expect(longDate('2026-10-29')).toBe('Thursday 29 October')
    expect(fullDate('2026-10-29')).toBe('Thursday 29 October 2026')
    expect(shortDate('2026-10-29')).toBe('29 Oct')
    expect(monthLabel('2026-10-29')).toBe('October 2026')
  })
})
