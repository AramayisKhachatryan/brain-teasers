// The month grid for the Calendar screen. Plain TypeScript, no React.
// Days are `YYYY-MM-DD` strings and months `YYYY-MM`, compared as text.
import type { Teaser } from './teaser'

export interface CalendarDay {
  date: string
  /** Day of the month, 1–31. */
  day: number
  /** Teasers given that day. */
  given: Teaser[]
  /** Teasers given earlier and still being solved that day. */
  ongoing: Teaser[]
  /** Part of a "given → solved" stretch, and whether it continues into the previous and next day. */
  span: { left: boolean; right: boolean } | null
  isToday: boolean
}

/** Local calendar date, `YYYY-MM-DD`. */
export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function monthOf(date: string): string {
  return date.slice(0, 7)
}

export function addMonths(month: string, delta: number): string {
  const [year, m] = month.split('-').map(Number)
  const index = year * 12 + (m - 1) + delta
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`
}

/** The months the calendar can show: from the first teaser to whichever is later, today or the last teaser. */
export function monthRange(teasers: readonly Teaser[], today: string): { first: string; last: string } {
  const months = [...teasers.map((teaser) => monthOf(teaser.date)), monthOf(today)].sort()
  return { first: months[0], last: months.at(-1)! }
}

/** The last day someone was working on a teaser: the day it was solved, or today while it's open. */
export function lastDayOf(teaser: Teaser, today: string): string {
  if (teaser.status === 'open') return today > teaser.date ? today : teaser.date
  return teaser.solvedOn ?? teaser.date
}

/** Weeks of the month, Monday first; null pads the days before the 1st and after the last day. */
export function monthWeeks(teasers: readonly Teaser[], month: string, today: string): (CalendarDay | null)[][] {
  const [year, m] = month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(year, m, 0)).getUTCDate()
  const mondayOffset = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7

  const cells: (CalendarDay | null)[] = Array(mondayOffset).fill(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${month}-${String(day).padStart(2, '0')}`
    const given = teasers.filter((teaser) => teaser.date === date)
    const ongoing = teasers.filter((teaser) => teaser.date < date && date <= lastDayOf(teaser, today))
    const stretches = teasers.filter((teaser) => teaser.date <= date && date <= lastDayOf(teaser, today) && lastDayOf(teaser, today) > teaser.date)
    const span = stretches.length
      ? {
          left: stretches.some((teaser) => teaser.date < date),
          right: stretches.some((teaser) => date < lastDayOf(teaser, today)),
        }
      : null
    cells.push({ date, day, given, ongoing, span, isToday: date === today })
  }
  while (cells.length % 7) cells.push(null)

  const weeks: (CalendarDay | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

/** What tapping a day opens: the teasers given that day first, then the ones still being solved. */
export function teasersForDay(day: CalendarDay): Teaser[] {
  return [...day.given, ...day.ongoing]
}
