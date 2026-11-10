import type { Teaser } from '../src/core/teaser'

/** Builds a teaser file's text from parts, so each test only spells out what it is about. */
export function teaserFile(
  options: {
    number?: number | string
    difficulty?: number | string
    date?: string
    title?: string
    status?: string
    solvedBy?: string
    extraFrontMatter?: string
    body?: string
  } = {},
): string {
  const {
    number = 1,
    difficulty = 3,
    date = '2026-10-29',
    title = 'Even rolls only',
    status = 'open',
    solvedBy = '[]',
    extraFrontMatter = '',
    body = '## Problem\nRoll a die.\n',
  } = options
  return `---\nnumber: ${number}\ndate: ${date}\ntitle: ${title}\ndifficulty: ${difficulty}\nstatus: ${status}\nsolved_by: ${solvedBy}\n${extraFrontMatter}---\n\n${body}`
}

export function makeTeaser(overrides: Partial<Teaser> & Pick<Teaser, 'slug'>): Teaser {
  return {
    number: 1,
    difficulty: 1,
    date: overrides.slug.slice(0, 10),
    title: overrides.slug,
    status: 'solved',
    solvedBy: [],
    solvedOn: null,
    days: null,
    problem: '<p>Problem</p>',
    hints: null,
    hintCount: 0,
    solution: '<p>Solution</p>',
    notes: null,
    ...overrides,
  }
}
