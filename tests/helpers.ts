import type { Teaser } from '../src/core/teaser'

/** Builds a teaser file's text from parts, so each test only spells out what it is about. */
export function teaserFile(
  options: {
    date?: string
    title?: string
    status?: string
    solvedBy?: string
    extraFrontMatter?: string
    body?: string
  } = {},
): string {
  const {
    date = '2026-10-29',
    title = 'Even rolls only',
    status = 'open',
    solvedBy = '[]',
    extraFrontMatter = '',
    body = '## Problem\nRoll a die.\n',
  } = options
  return `---\ndate: ${date}\ntitle: ${title}\nstatus: ${status}\nsolved_by: ${solvedBy}\n${extraFrontMatter}---\n\n${body}`
}

export function makeTeaser(overrides: Partial<Teaser> & Pick<Teaser, 'slug'>): Teaser {
  return {
    date: overrides.slug.slice(0, 10),
    title: overrides.slug,
    status: 'solved',
    solvedBy: [],
    solvedOn: null,
    problem: '<p>Problem</p>',
    hints: null,
    hintCount: 0,
    solution: '<p>Solution</p>',
    notes: null,
    ...overrides,
  }
}
