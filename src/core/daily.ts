// Picks the daily teaser from the puzzle bank (puzzles/brainstellar.json). Plain TypeScript with no imports,
// so Node can run scripts/daily-teaser.ts directly and the tests use the same code.

export type PuzzleSource = 'brainstellar' | 'winkler' | 'janestreet'

export interface BankPuzzle {
  id: string
  source: PuzzleSource
  number: number
  title: string
  /** 1–10, from puzzles/difficulty-ratings.md. */
  difficulty: number
  category: string
  /** The puzzle's page. It shows the solution, so it only goes into a teaser once the teaser is solved. */
  link: string
  /** Question only: the bank holds no hints, answers or solutions (the repo is public). */
  question: string
  /** available: can be posted. used: already a teaser. skip: never post (a repeat, or already spoiled). */
  status: 'available' | 'used' | 'skip'
  /** The teaser it became (file name without .md), when used. */
  teaser?: string
  /** Why it is skipped. */
  note?: string
}

/** Teasers are dated in Armenian time. */
export const TEASER_TIME_ZONE = 'Asia/Yerevan'

/** The calendar date in a time zone, as YYYY-MM-DD. */
export function dateIn(timeZone: string, now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

/** "Devil's penny" → "devils-penny"; at most about 40 characters, cut between words. */
export function slugify(title: string): string {
  const words = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  let slug = ''
  for (const word of words) {
    const next = slug ? `${slug}-${word}` : word
    if (slug && next.length > 40) break
    slug = next
  }
  return slug || 'teaser'
}

/** The teaser file for a bank puzzle: open, with the question as the problem and nothing else. */
export function teaserFile(puzzle: BankPuzzle, date: string, number: number): { fileName: string; content: string } {
  const fileName = `${date}-${slugify(puzzle.title)}.md`
  const content = [
    '---',
    `number: ${number}`,
    `date: ${date}`,
    `title: ${JSON.stringify(puzzle.title)}`,
    `difficulty: ${puzzle.difficulty}`,
    'status: open',
    'solved_by: []',
    '---',
    '',
    '## Problem',
    puzzle.question,
    '',
  ].join('\n')
  return { fileName, content }
}

export type DailyPlan =
  | { action: 'skip'; reason: string }
  | { action: 'add'; puzzle: BankPuzzle; fileName: string; content: string; bank: BankPuzzle[] }

/**
 * How many days a teaser stays the current one before the next arrives: at least 1, at most 7.
 * Solving it sooner and asking for a new one is always fine.
 */
export function daysToSolve(difficulty: number): number {
  if (difficulty <= 3) return 1
  if (difficulty <= 5) return 2
  if (difficulty === 6) return 3
  if (difficulty === 7) return 4
  if (difficulty === 8) return 5
  return 7
}

/** YYYY-MM-DD plus some days. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** What the planner needs to know about an existing teaser file, read from its front matter. */
export interface TeaserSummary {
  number: number
  date: string
  difficulty: number
  status: 'open' | 'solved'
}

export function summarize(source: string): TeaserSummary | null {
  const field = (key: string) => new RegExp(`^${key}:\\s*(.+?)\\s*(?:#.*)?$`, 'm').exec(source)?.[1]
  const number = Number(field('number'))
  const difficulty = Number(field('difficulty'))
  const date = field('date')
  const status = field('status')
  if (!number || !difficulty || !date || (status !== 'open' && status !== 'solved')) return null
  return { number, date, difficulty, status }
}

/** The next teaser's number: one more than the highest `number:` in the existing teaser files. */
export function nextNumber(teaserSources: readonly string[]): number {
  let highest = 0
  for (const source of teaserSources) {
    const match = /^number:\s*(\d+)\s*$/m.exec(source)
    if (match) highest = Math.max(highest, Number(match[1]))
  }
  return highest + 1
}

/** A day the daily job leaves alone, because Aramayis gives that day's teaser by hand (puzzles/days-off.json). */
export interface DayOff {
  date: string
  note?: string
}

export type Band = 'easy' | 'medium' | 'hard'

/** easy: 1–3, medium: 4–5, hard: 6 and up. */
export function bandOf(difficulty: number): Band {
  return difficulty <= 3 ? 'easy' : difficulty <= 5 ? 'medium' : 'hard'
}

/**
 * Picks the next puzzle. A Jane Street puzzle if this month has none yet and it's the 10th or later; otherwise
 * the difficulty band (easy / medium / hard) seen least among the last three teasers, then a random puzzle in it.
 */
export function pickPuzzle(input: {
  available: readonly BankPuzzle[]
  bank: readonly BankPuzzle[]
  recent: readonly TeaserSummary[]
  date: string
  randomIndex: (count: number) => number
}): BankPuzzle | null {
  const { available, randomIndex } = input
  if (available.length === 0) return null
  const month = input.date.slice(0, 7)
  const janeStreet = available.filter((puzzle) => puzzle.source === 'janestreet')
  const janeStreetThisMonth = input.bank.some(
    (puzzle) => puzzle.source === 'janestreet' && puzzle.status === 'used' && puzzle.teaser?.slice(0, 7) === month,
  )
  if (janeStreet.length > 0 && !janeStreetThisMonth && Number(input.date.slice(8, 10)) >= 10) {
    return janeStreet[randomIndex(janeStreet.length)]
  }

  const lastThree = [...input.recent].sort((a, b) => b.number - a.number).slice(0, 3)
  const seen = (band: Band) => lastThree.filter((teaser) => bandOf(teaser.difficulty) === band).length
  const bands = (['easy', 'medium', 'hard'] as const).filter((band) => available.some((p) => bandOf(p.difficulty) === band))
  const fewest = Math.min(...bands.map(seen))
  const candidates = bands.filter((band) => seen(band) === fewest)
  const band = candidates.length === 1 ? candidates[0] : candidates[randomIndex(candidates.length)]
  const inBand = available.filter((puzzle) => bandOf(puzzle.difficulty) === band)
  return inBand[randomIndex(inBand.length)]
}

/**
 * The morning job. Adds nothing on a day off, when today already has a teaser, or while the newest teaser is
 * still open and inside its days to solve (see daysToSolve). Otherwise adds a puzzle from pickPuzzle.
 * `extra` adds one anyway, for "give us a new teaser".
 */
export function planDailyTeaser(input: {
  bank: readonly BankPuzzle[]
  teaserFiles: readonly string[]
  /** Front matter of the existing teasers (see summarize). */
  recent?: readonly TeaserSummary[]
  /** The new teaser's number (see nextNumber). */
  number: number
  date: string
  randomIndex: (count: number) => number
  extra?: boolean
  daysOff?: readonly DayOff[]
  /** Puzzles not to pick this time, e.g. the one a replaced teaser had. */
  exclude?: readonly string[]
}): DailyPlan {
  const recent = input.recent ?? []
  if (!input.extra) {
    if (input.daysOff?.some((day) => day.date === input.date)) {
      return { action: 'skip', reason: `${input.date} is a day off in puzzles/days-off.json (teaser given by hand)` }
    }
    if (input.teaserFiles.some((name) => name.startsWith(`${input.date}-`))) {
      return { action: 'skip', reason: `there is already a teaser dated ${input.date}` }
    }
    const newest = [...recent].sort((a, b) => b.number - a.number)[0]
    if (newest && newest.status === 'open') {
      const next = addDays(newest.date, daysToSolve(newest.difficulty))
      if (input.date < next) {
        return { action: 'skip', reason: `#${newest.number} (difficulty ${newest.difficulty}) is still being solved; the next teaser is due ${next}` }
      }
    }
  }
  const available = input.bank.filter((puzzle) => puzzle.status === 'available' && !input.exclude?.includes(puzzle.id))
  const puzzle = pickPuzzle({ available, bank: input.bank, recent, date: input.date, randomIndex: input.randomIndex })
  if (!puzzle) return { action: 'skip', reason: 'the puzzle bank has no unused puzzles left' }

  const { fileName, content } = teaserFile(puzzle, input.date, input.number)
  if (input.teaserFiles.includes(fileName)) return { action: 'skip', reason: `teasers/${fileName} already exists` }
  const teaser = fileName.slice(0, -'.md'.length)
  const bank = input.bank.map((entry) => (entry.id === puzzle.id ? { ...entry, status: 'used' as const, teaser } : entry))
  return { action: 'add', puzzle, fileName, content, bank }
}
