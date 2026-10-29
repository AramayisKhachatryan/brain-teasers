// Search, filter and sort for the Archive screen. Plain TypeScript, no React.
import { newestFirst } from './select'
import type { Person, Teaser } from './teaser'

/** Who solved it: everyone's teasers, one person's (including ones solved together), or only joint solves. */
export type SolverFilter = 'all' | Person | 'both'
export type DateOrder = 'newest' | 'oldest'

export interface ArchiveView {
  query: string
  solver: SolverFilter
  order: DateOrder
}

export const DEFAULT_VIEW: ArchiveView = { query: '', solver: 'all', order: 'newest' }

/** Lowercase, without accents or apostrophes, "×" read as "x": "kings 8x8" finds "King's … 8×8". */
export function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/['’‘`]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

/** Every word of the query appears somewhere in the title, in any order. */
export function matchesQuery(title: string, query: string): boolean {
  const haystack = normalize(title)
  return normalize(query)
    .split(' ')
    .every((word) => haystack.includes(word))
}

export function matchesSolver(teaser: Teaser, solver: SolverFilter): boolean {
  if (solver === 'all') return true
  if (teaser.status !== 'solved') return false
  if (solver === 'both') return teaser.solvedBy.length === 2
  return teaser.solvedBy.includes(solver)
}

export function isFiltered(view: ArchiveView): boolean {
  return normalize(view.query) !== '' || view.solver !== 'all'
}

/** The archive as the view asks for it: matching teasers, sorted by date. */
export function viewArchive(teasers: readonly Teaser[], view: ArchiveView): Teaser[] {
  const sorted = newestFirst(teasers)
  if (view.order === 'oldest') sorted.reverse()
  return sorted.filter((teaser) => matchesQuery(teaser.title, view.query) && matchesSolver(teaser, view.solver))
}
