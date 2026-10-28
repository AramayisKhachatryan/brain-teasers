import { describe, expect, it } from 'vitest'
import { parseTeaserFile } from '../src/core/parse'
import { teaserFile } from './helpers'

const NAME = '2026-10-29-even-rolls.md'
const SOLVED_BODY = `## Problem
Roll a die.

## Hints
1. Think about what "all even" rules out. *(asked by Armen)*
2. Condition on the first roll. *(asked by Aramayis)*

## Solution
It is $\\frac{3}{2}$.

## Notes
We both guessed 3 first.
`

describe('parseTeaserFile: valid files', () => {
  it('parses an open teaser', () => {
    const teaser = parseTeaserFile(NAME, teaserFile())
    expect(teaser).toMatchObject({
      slug: '2026-10-29-even-rolls',
      date: '2026-10-29',
      title: 'Even rolls only',
      status: 'open',
      solvedBy: [],
      solvedOn: null,
      hints: null,
      hintCount: 0,
      solution: null,
      notes: null,
    })
    expect(teaser.problem).toBe('<p>Roll a die.</p>\n')
  })

  it('parses a solved teaser with every section', () => {
    const teaser = parseTeaserFile(
      NAME,
      teaserFile({ status: 'solved', solvedBy: '[armen, aramayis]', body: SOLVED_BODY }),
    )
    expect(teaser.status).toBe('solved')
    expect(teaser.solvedBy).toEqual(['aramayis', 'armen'])
    expect(teaser.hintCount).toBe(2)
    expect(teaser.hints).toContain('<ol>')
    expect(teaser.solution).toContain('class="katex"')
    expect(teaser.notes).toContain('We both guessed 3 first.')
  })

  it('accepts the comments shown in the documented format', () => {
    const source = `---
date: 2026-10-29
title: The two doors
status: open          # open while we're solving, solved when we're done
solved_by: []         # who solved it
---

## Problem
Text.
`
    expect(parseTeaserFile(NAME, source).title).toBe('The two doors')
  })

  it('accepts a solved teaser nobody solved, without hints or notes', () => {
    const teaser = parseTeaserFile(
      NAME,
      teaserFile({ status: 'solved', body: '## Problem\nP\n\n## Solution\nS\n' }),
    )
    expect(teaser.solvedBy).toEqual([])
    expect(teaser.hints).toBeNull()
  })

  it('reads the optional solved_on date', () => {
    const teaser = parseTeaserFile(
      NAME,
      teaserFile({ status: 'solved', extraFrontMatter: 'solved_on: 2026-10-31\n', body: '## Problem\nP\n\n## Solution\nS\n' }),
    )
    expect(teaser.solvedOn).toBe('2026-10-31')
  })

  it('accepts Windows line endings and a byte-order mark', () => {
    const source = '\uFEFF' + teaserFile().replace(/\n/g, '\r\n')
    expect(parseTeaserFile(NAME, source).problem).toBe('<p>Roll a die.</p>\n')
  })

  it('accepts a quoted title with a colon', () => {
    expect(parseTeaserFile(NAME, teaserFile({ title: '"Dice: part two"' })).title).toBe('Dice: part two')
  })

  it('renders inline and display math', () => {
    const teaser = parseTeaserFile(
      NAME,
      teaserFile({ body: '## Problem\nFind $\\mathbb{E}[N]$.\n\n$$\nP = \\frac{1}{4}\n$$\n' }),
    )
    expect(teaser.problem).toContain('class="katex"')
    expect(teaser.problem).toContain('katex-display')
  })

  it('leaves dollar amounts alone', () => {
    const body = '## Problem\nPay $5 to win $100 or $50, or $5/$10 (in $).\n'
    expect(parseTeaserFile(NAME, teaserFile({ body })).problem).toBe('<p>Pay $5 to win $100 or $50, or $5/$10 (in $).</p>\n')
  })

  it('renders math right before punctuation, as in "(probability $\\tfrac12$): …"', () => {
    const body = '## Problem\nTails (probability $\\tfrac12$): start over, so $1 + E$.\n'
    const html = parseTeaserFile(NAME, teaserFile({ body })).problem
    expect(html.match(/class="katex"/g)).toHaveLength(2)
    expect(html).toContain('): start over, so ')
  })

  it('renders $$…$$ inside a paragraph as display math', () => {
    const html = parseTeaserFile(NAME, teaserFile({ body: '## Problem\nSo $$E = 6$$ in the end.\n' })).problem
    expect(html).toContain('katex-display')
  })

  it('keeps an escaped dollar sign as text', () => {
    const html = parseTeaserFile(NAME, teaserFile({ body: '## Problem\nIt costs \\$x$ today.\n' })).problem
    expect(html).toBe('<p>It costs $x$ today.</p>\n')
  })

  it('opens links outside the app', () => {
    const teaser = parseTeaserFile(NAME, teaserFile({ body: '## Problem\nSee [this](https://example.com).\n' }))
    expect(teaser.problem).toContain('<a href="https://example.com" target="_blank" rel="noopener noreferrer">this</a>')
  })

  it('ignores "## " lines inside fenced code', () => {
    const teaser = parseTeaserFile(NAME, teaserFile({ body: '## Problem\n```\n## Solution\n```\n' }))
    expect(teaser.solution).toBeNull()
    expect(teaser.problem).toContain('## Solution')
  })
})

describe('parseTeaserFile: malformed files fail with a clear message', () => {
  const cases: [string, string, string, RegExp][] = [
    ['bad file name', '2026-10-29.md', teaserFile(), /file name must look like/],
    ['uppercase file name', '2026-10-29-Even.md', teaserFile(), /file name must look like/],
    ['no front matter', NAME, '## Problem\nX\n', /must start with a "---" line/],
    ['unclosed front matter', NAME, '---\ndate: 2026-10-29\n', /not closed/],
    ['invalid YAML', NAME, teaserFile({ title: '[oops' }), /not valid YAML/],
    ['unknown key', NAME, teaserFile({ extraFrontMatter: 'solvedby: []\n' }), /unknown front matter key "solvedby"/],
    ['missing key', NAME, '---\ndate: 2026-10-29\ntitle: T\nstatus: open\n---\n## Problem\nX\n', /missing "solved_by"/],
    ['impossible date', '2026-02-30-x.md', teaserFile({ date: '2026-02-30' }), /real date/],
    ['date mismatch', NAME, teaserFile({ date: '2026-10-30' }), /does not match the date in the file name/],
    ['empty title', NAME, teaserFile({ title: '""' }), /title must be non-empty/],
    ['bad status', NAME, teaserFile({ status: 'done' }), /status must be "open" or "solved"/],
    ['solved_by not a list', NAME, teaserFile({ solvedBy: 'armen' }), /solved_by must be a list/],
    ['unknown person', NAME, teaserFile({ status: 'solved', solvedBy: '[aram]', body: '## Problem\nP\n## Solution\nS\n' }), /can only contain aramayis and armen/],
    ['person twice', NAME, teaserFile({ status: 'solved', solvedBy: '[armen, armen]', body: '## Problem\nP\n## Solution\nS\n' }), /lists "armen" twice/],
    ['open but solved_by set', NAME, teaserFile({ solvedBy: '[armen]' }), /open teaser must have solved_by: \[\]/],
    ['open with a solution (spoiler)', NAME, teaserFile({ body: '## Problem\nP\n## Solution\nS\n' }), /open teaser may only contain "## Problem"/],
    ['open with hints (spoiler)', NAME, teaserFile({ body: '## Problem\nP\n## Hints\n1. H\n' }), /open teaser may only contain "## Problem"/],
    ['solved without solution', NAME, teaserFile({ status: 'solved', body: '## Problem\nP\n' }), /needs a "## Solution" section/],
    ['missing problem', NAME, teaserFile({ status: 'solved', body: '## Solution\nS\n' }), /"## Problem" section is missing/],
    ['unknown section', NAME, teaserFile({ body: '## Problem\nP\n## Answer\nA\n' }), /unknown section "## Answer"/],
    ['sections out of order', NAME, teaserFile({ status: 'solved', body: '## Problem\nP\n## Solution\nS\n## Hints\n1. H\n' }), /must be in the order/],
    ['duplicate section', NAME, teaserFile({ body: '## Problem\nP\n## Problem\nQ\n' }), /appears twice/],
    ['text before problem', NAME, teaserFile({ body: 'Intro\n## Problem\nP\n' }), /text before the first "## Problem"/],
    ['empty section', NAME, teaserFile({ body: '## Problem\n\n' }), /"## Problem" section is empty/],
    ['solved_on on an open teaser', NAME, teaserFile({ extraFrontMatter: 'solved_on: 2026-10-29\n' }), /solved_on is only for solved teasers/],
    ['solved_on before the date', NAME, teaserFile({ status: 'solved', extraFrontMatter: 'solved_on: 2026-10-28\n', body: '## Problem\nP\n## Solution\nS\n' }), /before the teaser's date/],
    ['impossible solved_on', NAME, teaserFile({ status: 'solved', extraFrontMatter: 'solved_on: 2026-10-32\n', body: '## Problem\nP\n## Solution\nS\n' }), /solved_on must be a real date/],
    ['broken math', NAME, teaserFile({ body: '## Problem\nFind $\\frac{1}$ now.\n' }), /could not render "## Problem"/],
  ]

  it.each(cases)('%s', (_label, fileName, source, message) => {
    expect(() => parseTeaserFile(fileName, source)).toThrow(message)
  })

  it('names the file in the error', () => {
    expect(() => parseTeaserFile(NAME, teaserFile({ status: 'done' }))).toThrow(`teasers/${NAME}:`)
  })
})
