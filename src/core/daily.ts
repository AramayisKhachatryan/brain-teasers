// Picks the daily teaser from the puzzle bank (puzzles/brainstellar.json). Plain TypeScript with no imports,
// so Node can run scripts/daily-teaser.ts directly and the tests use the same code.

export interface BankPuzzle {
  id: string
  number: number
  title: string
  difficulty: string
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
export function teaserFile(puzzle: BankPuzzle, date: string): { fileName: string; content: string } {
  const fileName = `${date}-${slugify(puzzle.title)}.md`
  const content = [
    '---',
    `date: ${date}`,
    `title: ${JSON.stringify(puzzle.title)}`,
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
 * One teaser a day: none if the day already has one, otherwise a random puzzle that hasn't been used.
 * `extra` adds one anyway, for "give us another teaser".
 */
export function planDailyTeaser(input: {
  bank: readonly BankPuzzle[]
  teaserFiles: readonly string[]
  date: string
  randomIndex: (count: number) => number
  extra?: boolean
}): DailyPlan {
  if (!input.extra && input.teaserFiles.some((name) => name.startsWith(`${input.date}-`))) {
    return { action: 'skip', reason: `there is already a teaser dated ${input.date}` }
  }
  const available = input.bank.filter((puzzle) => puzzle.status === 'available')
  if (available.length === 0) return { action: 'skip', reason: 'the puzzle bank has no unused puzzles left' }

  const puzzle = available[input.randomIndex(available.length)]
  const { fileName, content } = teaserFile(puzzle, input.date)
  if (input.teaserFiles.includes(fileName)) return { action: 'skip', reason: `teasers/${fileName} already exists` }
  const teaser = fileName.slice(0, -'.md'.length)
  const bank = input.bank.map((entry) => (entry.id === puzzle.id ? { ...entry, status: 'used' as const, teaser } : entry))
  return { action: 'add', puzzle, fileName, content, bank }
}
