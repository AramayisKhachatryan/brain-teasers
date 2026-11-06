// Checks the puzzle bank the daily teaser comes from, so a bad entry fails here and not on the phones.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { normalize } from '../src/core/archive'
import { teaserFile, type BankPuzzle } from '../src/core/daily'
import { parseTeaserFile } from '../src/core/parse'

const bankPath = fileURLToPath(new URL('../puzzles/brainstellar.json', import.meta.url))
const teasersDir = fileURLToPath(new URL('../teasers/', import.meta.url))
const bankText = readFileSync(bankPath, 'utf8')
const bank: BankPuzzle[] = JSON.parse(bankText)

describe('puzzles/brainstellar.json', () => {
  it('has unique ids and numbers', () => {
    expect(new Set(bank.map((p) => p.id)).size).toBe(bank.length)
    expect(new Set(bank.map((p) => p.number)).size).toBe(bank.length)
  })

  it('keeps the format the daily script writes back', () => {
    expect(`${JSON.stringify(bank, null, 2)}\n`).toBe(bankText)
  })

  it.each(bank.map((p) => [p.id, p] as const))('%s is well formed', (_id, p) => {
    expect(p.title.trim()).not.toBe('')
    expect(p.question.trim()).not.toBe('')
    expect(['brainstellar', 'winkler', 'janestreet']).toContain(p.source)
    expect(Number.isInteger(p.difficulty) && p.difficulty >= 1 && p.difficulty <= 10).toBe(true)
    if (p.source === 'brainstellar') expect(p.link).toMatch(/^https:\/\/brainstellar\.com\/puzzles\//)
    expect(['available', 'used', 'skip']).toContain(p.status)
    if (p.status === 'used') expect(existsSync(`${teasersDir}${p.teaser}.md`)).toBe(true)
    if (p.status === 'skip') expect(p.note?.trim()).toBeTruthy()
    if (p.status === 'available') expect(p.teaser).toBeUndefined()
  })

  it.each(bank.map((p) => [p.id, p] as const))('%s becomes a valid teaser', (_id, p) => {
    const { fileName, content } = teaserFile(p, '2030-01-01', 99)
    expect(() => parseTeaserFile(fileName, content)).not.toThrow()
  })

  it('shows money as money, not math', () => {
    for (const number of [104, 1004]) {
      const p = bank.find((entry) => entry.number === number)!
      const { fileName, content } = teaserFile(p, '2030-01-01', 99)
      const html = parseTeaserFile(fileName, content).problem
      expect(html).not.toContain('katex')
      expect(html).toContain('$')
    }
  })

  it('has no available puzzle with the title of a teaser we already have', () => {
    const titles = readdirSync(teasersDir)
      .filter((name) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(name))
      .map((name) => normalize(parseTeaserFile(name, readFileSync(teasersDir + name, 'utf8')).title))
    const clashes = bank.filter((p) => p.status === 'available' && titles.includes(normalize(p.title)))
    expect(clashes.map((p) => p.id)).toEqual([])
  })
})
