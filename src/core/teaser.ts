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
  /** File name without `.md`, e.g. `2026-10-29-broken-stick`. Used in URLs. */
  slug: string
  /** `YYYY-MM-DD` */
  date: string
  title: string
  status: Status
  solvedBy: Person[]
  /** Rendered HTML of each section. Only `problem` exists while a teaser is open. */
  problem: string
  hints: string | null
  hintCount: number
  solution: string | null
  notes: string | null
}

export function isPerson(value: unknown): value is Person {
  return typeof value === 'string' && (PEOPLE as readonly string[]).includes(value)
}
