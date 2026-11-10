// The shape of a teaser after its markdown file has been parsed at build time.
// Plain TypeScript, shared by the app, the build plugin and the tests.

export const PEOPLE = ['aramayis', 'armen'] as const
export type Person = (typeof PEOPLE)[number]

export const DISPLAY_NAME: Record<Person, string> = {
  aramayis: 'Aramayis',
  armen: 'Armen',
}

export type Status = 'open' | 'solved'

export interface Teaser {
  /** File name without `.md`, e.g. `2026-10-29-twelve-balls`. Used in URLs. */
  slug: string
  /** Its place in the series: #1 is the first teaser we ever did. Shown before the title. */
  number: number
  /** 1–10, from puzzles/difficulty-ratings.md or estimated on the same scale. Each solver gets this many points. */
  difficulty: number
  /** `YYYY-MM-DD` */
  date: string
  title: string
  status: Status
  solvedBy: Person[]
  /** `YYYY-MM-DD` the day it was finished, when known. Solving sometimes takes more than a day. */
  solvedOn: string | null
  /** Days to solve, when set by hand (`days:`); otherwise it follows the difficulty (daysToSolve). */
  days: number | null
  /** Rendered HTML of each section. Only `problem` exists while a teaser is open. */
  problem: string
  hints: string | null
  hintCount: number
  solution: string | null
  notes: string | null
}

/** "#11 Parking lot": the title as it reads in text (notifications, labels). */
export function numberedTitle(teaser: Pick<Teaser, 'number' | 'title'>): string {
  return `#${teaser.number} ${teaser.title}`
}

export function isPerson(value: unknown): value is Person {
  return typeof value === 'string' && (PEOPLE as readonly string[]).includes(value)
}
