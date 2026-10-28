// Parses and validates one teaser file. Runs at build time (Vite plugin) and in tests,
// never in the browser, so a malformed file fails the build instead of the live app.

import katex from 'katex'
import { Marked, type TokenizerAndRendererExtension, type Tokens } from 'marked'
import { parse as parseYaml } from 'yaml'
import { PEOPLE, isPerson, type Person, type Status, type Teaser } from './teaser'

export class TeaserFileError extends Error {
  constructor(fileName: string, problem: string) {
    super(`teasers/${fileName}: ${problem}`)
    this.name = 'TeaserFileError'
  }
}

export const FILE_NAME = /^(\d{4}-\d{2}-\d{2})-([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/
const SECTION_ORDER = ['Problem', 'Hints', 'Solution', 'Notes'] as const
type SectionName = (typeof SECTION_ORDER)[number]
const FRONT_MATTER_KEYS = ['date', 'title', 'status', 'solved_by'] as const
const OPTIONAL_KEYS = ['solved_on'] as const

// Math follows Pandoc's rule, so money like "$5 or $10" stays text: the opening $ is followed by a
// non-space, the closing $ comes right after a non-space and is not followed by a digit. `$$…$$` is display math.
const INLINE_MATH = /^(\$\$?)(?!\s)((?:\\.|[^\\$\n])+?)(?<!\s)\1(?!\d)/
const BLOCK_MATH = /^\$\$\n((?:\\[^]|[^\\])+?)\n\$\$(?:\n|$)/

interface MathToken extends Tokens.Generic {
  text: string
  displayMode: boolean
}

const renderMath = (token: Tokens.Generic) =>
  katex.renderToString((token as MathToken).text, {
    displayMode: (token as MathToken).displayMode,
    throwOnError: true,
    output: 'htmlAndMathml',
  })

const inlineMath: TokenizerAndRendererExtension = {
  name: 'inlineMath',
  level: 'inline',
  start: (src) => src.search(/(?<!\\)\$/),
  tokenizer(src) {
    const match = INLINE_MATH.exec(src)
    if (match) return { type: 'inlineMath', raw: match[0], text: match[2], displayMode: match[1] === '$$' }
  },
  renderer: renderMath,
}

const blockMath: TokenizerAndRendererExtension = {
  name: 'blockMath',
  level: 'block',
  tokenizer(src) {
    const match = BLOCK_MATH.exec(src)
    if (match) return { type: 'blockMath', raw: match[0], text: match[1], displayMode: true }
  },
  renderer: (token) => renderMath(token) + '\n',
}

const markdown = new Marked({ gfm: true })
markdown.use({ extensions: [blockMath, inlineMath] })
markdown.use({
  renderer: {
    // Links leave the app: in a Home Screen app an in-place navigation has no way back.
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens)
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''
      return `<a href="${escapeAttr(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
    },
  },
})

export function parseTeaserFile(fileName: string, source: string): Teaser {
  const fail = (problem: string): never => {
    throw new TeaserFileError(fileName, problem)
  }

  const nameMatch = FILE_NAME.exec(fileName)
  if (!nameMatch) {
    fail('the file name must look like YYYY-MM-DD-short-name.md (lowercase letters, digits and dashes)')
  }
  const fileDate = nameMatch![1]

  const text = source.replace(/^﻿/, '').replace(/\r\n?/g, '\n')
  const { frontMatter, body } = splitFrontMatter(text, fail)

  let data: unknown
  try {
    data = parseYaml(frontMatter)
  } catch (error) {
    fail(`the front matter is not valid YAML (${(error as Error).message.split('\n')[0]})`)
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    fail('the front matter must be a list of "key: value" lines')
  }
  const fields = data as Record<string, unknown>

  const allowedKeys: readonly string[] = [...FRONT_MATTER_KEYS, ...OPTIONAL_KEYS]
  for (const key of Object.keys(fields)) {
    if (!allowedKeys.includes(key)) {
      fail(`unknown front matter key "${key}" (allowed: ${allowedKeys.join(', ')})`)
    }
  }
  for (const key of FRONT_MATTER_KEYS) {
    if (!(key in fields)) fail(`the front matter is missing "${key}"`)
  }

  const date = fields.date
  if (typeof date !== 'string' || !isCalendarDate(date)) {
    fail('date must be a real date written as YYYY-MM-DD')
  }
  if (date !== fileDate) {
    fail(`date ${String(date)} does not match the date in the file name (${fileDate})`)
  }

  const title = fields.title
  if (typeof title !== 'string' || title.trim() === '') {
    fail('title must be non-empty text (wrap it in "double quotes" if it contains a colon or " #")')
  }

  const status = fields.status
  if (status !== 'open' && status !== 'solved') {
    fail('status must be "open" or "solved"')
  }

  const solvedByRaw = fields.solved_by
  if (!Array.isArray(solvedByRaw)) {
    fail('solved_by must be a list: [], [aramayis], [armen] or [aramayis, armen]')
  }
  const solvedBy: Person[] = []
  for (const name of solvedByRaw as unknown[]) {
    if (!isPerson(name)) fail(`solved_by can only contain ${PEOPLE.join(' and ')}, found "${String(name)}"`)
    if (solvedBy.includes(name as Person)) fail(`solved_by lists "${String(name)}" twice`)
    solvedBy.push(name as Person)
  }
  solvedBy.sort((a, b) => PEOPLE.indexOf(a) - PEOPLE.indexOf(b))

  let solvedOn: string | null = null
  if ('solved_on' in fields) {
    const value = fields.solved_on
    if (typeof value !== 'string' || !isCalendarDate(value)) fail('solved_on must be a real date written as YYYY-MM-DD')
    if (status !== 'solved') fail('solved_on is only for solved teasers')
    if ((value as string) < (date as string)) fail(`solved_on ${String(value)} is before the teaser's date ${String(date)}`)
    solvedOn = value as string
  }

  const sections = splitSections(body, fail)

  if (!sections.has('Problem')) fail('the "## Problem" section is missing')
  if (status === 'open') {
    if (solvedBy.length > 0) fail('an open teaser must have solved_by: []')
    for (const name of sections.keys()) {
      if (name !== 'Problem') {
        fail(`an open teaser may only contain "## Problem" (found "## ${name}"). The repo is public, so hints and the solution are added when it is solved`)
      }
    }
  } else if (!sections.has('Solution')) {
    fail('a solved teaser needs a "## Solution" section')
  }

  const render = (name: SectionName): string | null => {
    const source = sections.get(name)
    if (source === undefined) return null
    try {
      return markdown.parse(source, { async: false })
    } catch (error) {
      return fail(`could not render "## ${name}" (${(error as Error).message.split('\n')[0]})`)
    }
  }

  const hintsSource = sections.get('Hints')

  return {
    slug: fileName.slice(0, -'.md'.length),
    date: date as string,
    title: (title as string).trim(),
    status: status as Status,
    solvedBy,
    solvedOn,
    problem: render('Problem')!,
    hints: render('Hints'),
    hintCount: hintsSource === undefined ? 0 : countListItems(hintsSource),
    solution: render('Solution'),
    notes: render('Notes'),
  }
}

function splitFrontMatter(text: string, fail: (problem: string) => never) {
  const lines = text.split('\n')
  if (lines[0]?.trim() !== '---') fail('the file must start with a "---" line, then the front matter')
  const end = lines.findIndex((line, index) => index > 0 && line.trim() === '---')
  if (end === -1) fail('the front matter is not closed with a "---" line')
  return {
    frontMatter: lines.slice(1, end).join('\n'),
    body: lines.slice(end + 1),
  }
}

/** Splits the body on `## Heading` lines, ignoring any inside fenced code blocks. */
function splitSections(lines: string[], fail: (problem: string) => never): Map<SectionName, string> {
  const sections = new Map<SectionName, string>()
  let current: SectionName | null = null
  let buffer: string[] = []
  let fence: string | null = null

  const flush = () => {
    if (current === null) {
      if (buffer.some((line) => line.trim() !== '')) {
        fail('there is text before the first "## Problem" heading')
      }
      return
    }
    const content = buffer.join('\n').trim()
    if (content === '') fail(`the "## ${current}" section is empty (remove the heading or fill it in)`)
    sections.set(current, content)
  }

  for (const line of lines) {
    const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(line)
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1][0]
      else if (fenceMatch[1][0] === fence) fence = null
    }
    const heading = fence === null ? /^##\s+(.+?)\s*#*\s*$/.exec(line) : null
    if (!heading) {
      buffer.push(line)
      continue
    }
    flush()
    const name = heading[1] as SectionName
    if (!SECTION_ORDER.includes(name)) {
      fail(`unknown section "## ${heading[1]}" (allowed: ${SECTION_ORDER.join(', ')})`)
    }
    if (sections.has(name)) fail(`the "## ${name}" section appears twice`)
    const previous = [...sections.keys()].at(-1)
    if (previous !== undefined && SECTION_ORDER.indexOf(name) < SECTION_ORDER.indexOf(previous)) {
      fail(`sections must be in the order ${SECTION_ORDER.join(', ')}`)
    }
    current = name
    buffer = []
  }
  flush()
  return sections
}

function countListItems(source: string): number {
  return markdown
    .lexer(source)
    .filter((token): token is Tokens.List => token.type === 'list')
    .reduce((total, list) => total + list.items.length, 0)
}

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}
