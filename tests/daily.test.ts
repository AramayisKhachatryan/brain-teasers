import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { winklerBank, addDays, bandOf, dateIn, daysToSolve, nextNumber, planDailyTeaser, slugify, summarize, teaserFile, type BankPuzzle, type TeaserSummary } from '../src/core/daily'
import { FILE_NAME, parseTeaserFile } from '../src/core/parse'

const puzzle = (
  number: number,
  status: BankPuzzle['status'],
  title = `Puzzle ${number}`,
  difficulty = 3,
  source: BankPuzzle['source'] = 'brainstellar',
): BankPuzzle => ({
  id: `${source}-${number}`,
  source,
  number,
  title,
  difficulty,
  category: 'probability',
  link: `https://brainstellar.com/puzzles/easy/${number}`,
  question: `Question ${number} with $x^2$ and \\$5.`,
  status,
})

describe('dateIn', () => {
  it('uses the Armenian date (UTC+4)', () => {
    expect(dateIn('Asia/Yerevan', new Date('2026-11-02T03:35:00Z'))).toBe('2026-11-02')
    expect(dateIn('Asia/Yerevan', new Date('2026-11-02T20:30:00Z'))).toBe('2026-11-03')
  })
})

describe('slugify', () => {
  it.each([
    ["Devil's penny", 'devils-penny'],
    ['Pirates & the treasure', 'pirates-and-the-treasure'],
    ['To begin or not to begin?', 'to-begin-or-not-to-begin'],
    ['100 light bulbs', '100-light-bulbs'],
    ["Prisoners' hats in many colours", 'prisoners-hats-in-many-colours'],
    ['A very long title that keeps going well past forty characters', 'a-very-long-title-that-keeps-going-well'],
  ])('%s → %s', (title, slug) => {
    expect(slugify(title)).toBe(slug)
  })
})

describe('teaserFile', () => {
  it('makes a valid open teaser with only the problem', () => {
    const { fileName, content } = teaserFile(puzzle(7, 'available', "Devil's penny & coins"), '2026-11-03', 12)
    expect(fileName).toBe('2026-11-03-devils-penny-and-coins.md')
    expect(FILE_NAME.test(fileName)).toBe(true)
    const teaser = parseTeaserFile(fileName, content)
    expect(teaser).toMatchObject({ number: 12, difficulty: 3, title: "Devil's penny & coins", status: 'open', solvedBy: [], solution: null })
    expect(teaser.problem).toContain('class="katex"')
    expect(teaser.problem).toContain('$5')
  })
})

describe('nextNumber', () => {
  it('is one more than the highest number in the teaser files', () => {
    expect(nextNumber(['---\nnumber: 9\ndate: x\n---', '---\nnumber: 11\n---', '---\nnumber: 10\n---'])).toBe(12)
    expect(nextNumber([])).toBe(1)
  })
})

describe('planDailyTeaser', () => {
  const bank = [puzzle(1, 'used'), puzzle(2, 'available'), puzzle(3, 'skip'), puzzle(4, 'available')]

  it('adds a random unused puzzle and marks it used', () => {
    const plan = planDailyTeaser({ number: 12, bank, teaserFiles: ['2026-11-02-x.md'], date: '2026-11-03', randomIndex: (n) => 1 % n })
    expect(plan.action).toBe('add')
    if (plan.action !== 'add') return
    expect(plan.puzzle.id).toBe('brainstellar-4')
    expect(plan.fileName).toBe('2026-11-03-puzzle-4.md')
    expect(plan.bank.find((p) => p.id === 'brainstellar-4')).toMatchObject({ status: 'used', teaser: '2026-11-03-puzzle-4' })
    expect(plan.bank.filter((p) => p.status === 'available').map((p) => p.id)).toEqual(['brainstellar-2'])
  })

  it('only ever picks available puzzles', () => {
    const picked = new Set<string>()
    for (let i = 0; i < 2; i++) {
      const plan = planDailyTeaser({ number: 12, bank, teaserFiles: [], date: '2026-11-03', randomIndex: (n) => i % n })
      if (plan.action === 'add') picked.add(plan.puzzle.id)
    }
    expect([...picked].sort()).toEqual(['brainstellar-2', 'brainstellar-4'])
  })

  it('adds nothing when the day already has a teaser', () => {
    const plan = planDailyTeaser({ number: 12, bank, teaserFiles: ['2026-11-03-splitting-stones.md'], date: '2026-11-03', randomIndex: () => 0 })
    expect(plan).toEqual({ action: 'skip', reason: 'there is already a teaser dated 2026-11-03' })
  })

  it('adds another teaser on the same day when asked for an extra one', () => {
    const plan = planDailyTeaser({ number: 12, bank, teaserFiles: ['2026-11-03-splitting-stones.md'], date: '2026-11-03', randomIndex: () => 0, extra: true })
    expect(plan).toMatchObject({ action: 'add', fileName: '2026-11-03-puzzle-2.md' })
  })

  it('adds nothing on a day off, unless asked for an extra one', () => {
    const daysOff = [{ date: '2026-11-03', note: 'given by hand' }]
    const plan = planDailyTeaser({ number: 12, bank, teaserFiles: [], date: '2026-11-03', randomIndex: () => 0, daysOff })
    expect(plan).toEqual({ action: 'skip', reason: '2026-11-03 is a day off in puzzles/days-off.json (teaser given by hand)' })
    expect(planDailyTeaser({ number: 12, bank, teaserFiles: [], date: '2026-11-04', randomIndex: () => 0, daysOff }).action).toBe('add')
    expect(planDailyTeaser({ number: 12, bank, teaserFiles: [], date: '2026-11-03', randomIndex: () => 0, daysOff, extra: true }).action).toBe('add')
  })

  it('reads a valid puzzles/days-off.json', () => {
    const daysOff = JSON.parse(readFileSync(new URL('../puzzles/days-off.json', import.meta.url), 'utf8'))
    expect(Array.isArray(daysOff)).toBe(true)
    for (const day of daysOff) expect(day.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('adds nothing when the bank is used up', () => {
    const plan = planDailyTeaser({ number: 12, bank: [puzzle(1, 'used')], teaserFiles: [], date: '2026-11-03', randomIndex: () => 0 })
    expect(plan).toEqual({ action: 'skip', reason: 'the puzzle bank has no unused puzzles left' })
  })
})

describe('days to solve', () => {
  it('goes from 1 day for easy teasers to a week for the hardest', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(daysToSolve)).toEqual([1, 1, 1, 2, 2, 3, 4, 5, 7, 7])
  })

  it('adds days across month ends', () => {
    expect(addDays('2026-11-29', 3)).toBe('2026-12-02')
  })

  it('reads the front matter the planner needs', () => {
    expect(summarize('---\nnumber: 14\ndate: 2026-11-06\ntitle: "X: y"\ndifficulty: 6\nstatus: open # c\nsolved_by: []\n---')).toEqual({
      number: 14,
      date: '2026-11-06',
      difficulty: 6,
      status: 'open',
    })
  })
})

describe('planDailyTeaser with days to solve and mixing', () => {
  const t = (number: number, date: string, difficulty: number, status: TeaserSummary['status'] = 'open'): TeaserSummary => ({
    number,
    date,
    difficulty,
    status,
  })
  const bank = [puzzle(1, 'available', 'Easy one', 2), puzzle(2, 'available', 'Medium one', 5), puzzle(3, 'available', 'Hard one', 7)]
  const plan = (date: string, recent: TeaserSummary[], extra = false, randomIndex = (n: number) => 0 * n) =>
    planDailyTeaser({ number: 20, bank, teaserFiles: [], recent, date, randomIndex, extra })

  it('waits while the newest teaser is open and inside its days', () => {
    // difficulty 6: 3 days, so 6, 7 and 8 November, and the next one on the 9th
    expect(plan('2026-11-08', [t(19, '2026-11-06', 6)])).toEqual({
      action: 'skip',
      reason: '#19 (difficulty 6) is still being solved; the next teaser is due 2026-11-09',
    })
    expect(plan('2026-11-09', [t(19, '2026-11-06', 6)]).action).toBe('add')
  })

  it('moves on once the newest teaser is solved, and on request', () => {
    expect(plan('2026-11-07', [t(19, '2026-11-06', 8, 'solved')]).action).toBe('add')
    expect(plan('2026-11-07', [t(19, '2026-11-06', 8)], true).action).toBe('add')
  })

  it('picks the difficulty band seen least in the last three teasers', () => {
    const recent = [t(17, '2026-11-01', 2, 'solved'), t(18, '2026-11-02', 3, 'solved'), t(19, '2026-11-03', 7, 'solved')]
    const result = plan('2026-11-05', recent)
    expect(result.action === 'add' && result.puzzle.title).toBe('Medium one')
    expect(['easy', 'medium', 'hard'].map((b) => [2, 5, 7].map(bandOf).includes(b as never))).toEqual([true, true, true])
  })

  it('posts a Jane Street puzzle from the 10th if the month has none yet', () => {
    const withJs = [...bank, puzzle(1, 'available', 'Grid', 8, 'janestreet')]
    const run = (date: string, list = withJs) =>
      planDailyTeaser({ number: 20, bank: list, teaserFiles: [], recent: [], date, randomIndex: () => 0 })
    const early = run('2026-11-09')
    expect(early.action === 'add' && early.puzzle.source).toBe('brainstellar')
    // outside the monthly slot, Jane Street never comes up, even when it's all that's left in a band
    const onlyHardIsJs = [puzzle(1, 'available', 'Easy', 2), puzzle(9, 'available', 'Grid', 8, 'janestreet')]
    const hardTurn = [t(17, '2026-11-01', 2, 'solved'), t(18, '2026-11-02', 4, 'solved'), t(19, '2026-11-03', 5, 'solved')]
    const pick = planDailyTeaser({ number: 20, bank: onlyHardIsJs, teaserFiles: [], recent: hardTurn, date: '2026-11-05', randomIndex: () => 0 })
    expect(pick.action === 'add' && pick.puzzle.source).toBe('brainstellar')
    const due = run('2026-11-10')
    expect(due.action === 'add' && due.puzzle.source).toBe('janestreet')
    const doneThisMonth = [...withJs, { ...puzzle(2, 'used', 'Old grid', 8, 'janestreet'), teaser: '2026-11-03-old-grid' }]
    const again = run('2026-11-20', doneThisMonth)
    expect(again.action === 'add' && again.puzzle.source).toBe('brainstellar')
  })

  it('never picks an excluded puzzle', () => {
    const result = planDailyTeaser({ number: 20, bank, teaserFiles: [], recent: [], date: '2026-11-05', randomIndex: () => 0, exclude: ['brainstellar-1', 'brainstellar-2'] })
    expect(result.action === 'add' && result.puzzle.id).toBe('brainstellar-3')
  })
})

describe('winklerBank', () => {
  it('marks used puzzles and the ones that need a figure', () => {
    const base = { source: 'winkler' as const, category: 'winkler', question: 'Q?' }
    const result = winklerBank(
      [
        { ...base, id: 'winkler-1', number: 1, title: 'A', difficulty: 2 },
        { ...base, id: 'winkler-2', number: 2, title: 'B', difficulty: 5, needs_figure: true },
        { ...base, id: 'winkler-3', number: 3, title: 'C', difficulty: 7 },
      ],
      [{ id: 'winkler-3', teaser: '2026-11-08-c' }],
    )
    expect(result.map((p) => [p.id, p.status, p.teaser ?? p.note ?? null])).toEqual([
      ['winkler-1', 'available', null],
      ['winkler-2', 'skip', 'Needs a figure from the book'],
      ['winkler-3', 'used', '2026-11-08-c'],
    ])
    expect('needs_figure' in result[1]).toBe(false)
  })

  it('has a valid puzzles/winkler-used.json', () => {
    const used = JSON.parse(readFileSync(new URL('../puzzles/winkler-used.json', import.meta.url), 'utf8'))
    expect(Array.isArray(used)).toBe(true)
    for (const entry of used) {
      expect(entry.id).toMatch(/^winkler-\d+$/)
      expect(readFileSync(new URL(`../teasers/${entry.teaser}.md`, import.meta.url), 'utf8')).toContain('## Problem')
    }
  })
})

describe('days set by hand', () => {
  const bank = [puzzle(1, 'available', 'One', 3), puzzle(2, 'available', 'Two', 6, 'janestreet')]
  const open = (days?: number): TeaserSummary => ({ number: 15, date: '2026-11-11', difficulty: 6, status: 'open', ...(days ? { days } : {}) })

  it('waits the days written in the teaser instead of the difficulty’s', () => {
    const run = (date: string, recent: TeaserSummary[]) =>
      planDailyTeaser({ number: 16, bank, teaserFiles: [], recent, date, randomIndex: () => 0 }).action
    expect(run('2026-11-14', [open()])).toBe('add') // difficulty 6: 3 days
    expect(run('2026-11-20', [open(10)])).toBe('skip')
    expect(run('2026-11-21', [open(10)])).toBe('add')
  })

  it('picks the puzzle asked for and writes its days', () => {
    const plan = planDailyTeaser({ number: 16, bank, teaserFiles: [], date: '2026-11-11', randomIndex: () => 0, extra: true, pick: 'janestreet-2', days: 10 })
    expect(plan.action === 'add' && plan.puzzle.id).toBe('janestreet-2')
    expect(plan.action === 'add' && plan.content).toContain('days: 10\n')
    const parsed = plan.action === 'add' ? parseTeaserFile(plan.fileName, plan.content) : null
    expect(parsed?.days).toBe(10)
    expect(summarize(plan.action === 'add' ? plan.content : '')?.days).toBe(10)
  })

  it('says so when the puzzle asked for is not available', () => {
    expect(planDailyTeaser({ number: 16, bank, teaserFiles: [], date: '2026-11-11', randomIndex: () => 0, extra: true, pick: 'nope' })).toEqual({
      action: 'skip',
      reason: 'nope is not an available puzzle',
    })
  })
})
