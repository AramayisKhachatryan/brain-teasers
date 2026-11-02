import { describe, expect, it } from 'vitest'
import { dateIn, planDailyTeaser, slugify, teaserFile, type BankPuzzle } from '../src/core/daily'
import { FILE_NAME, parseTeaserFile } from '../src/core/parse'

const puzzle = (number: number, status: BankPuzzle['status'], title = `Puzzle ${number}`): BankPuzzle => ({
  id: `brainstellar-${number}`,
  number,
  title,
  difficulty: 'easy',
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
    const { fileName, content } = teaserFile(puzzle(7, 'available', "Devil's penny & coins"), '2026-11-03')
    expect(fileName).toBe('2026-11-03-devils-penny-and-coins.md')
    expect(FILE_NAME.test(fileName)).toBe(true)
    const teaser = parseTeaserFile(fileName, content)
    expect(teaser).toMatchObject({ title: "Devil's penny & coins", status: 'open', solvedBy: [], solution: null })
    expect(teaser.problem).toContain('class="katex"')
    expect(teaser.problem).toContain('$5')
  })
})

describe('planDailyTeaser', () => {
  const bank = [puzzle(1, 'used'), puzzle(2, 'available'), puzzle(3, 'skip'), puzzle(4, 'available')]

  it('adds a random unused puzzle and marks it used', () => {
    const plan = planDailyTeaser({ bank, teaserFiles: ['2026-11-02-x.md'], date: '2026-11-03', randomIndex: () => 1 })
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
      const plan = planDailyTeaser({ bank, teaserFiles: [], date: '2026-11-03', randomIndex: () => i })
      if (plan.action === 'add') picked.add(plan.puzzle.id)
    }
    expect([...picked].sort()).toEqual(['brainstellar-2', 'brainstellar-4'])
  })

  it('adds nothing when the day already has a teaser', () => {
    const plan = planDailyTeaser({ bank, teaserFiles: ['2026-11-03-splitting-stones.md'], date: '2026-11-03', randomIndex: () => 0 })
    expect(plan).toEqual({ action: 'skip', reason: 'there is already a teaser dated 2026-11-03' })
  })

  it('adds nothing when the bank is used up', () => {
    const plan = planDailyTeaser({ bank: [puzzle(1, 'used')], teaserFiles: [], date: '2026-11-03', randomIndex: () => 0 })
    expect(plan).toEqual({ action: 'skip', reason: 'the puzzle bank has no unused puzzles left' })
  })
})
