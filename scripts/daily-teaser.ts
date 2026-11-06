// Adds today's teaser (Armenian date) from the puzzle bank and marks the puzzle as used, once the newest teaser's
// days to solve (by difficulty, see daysToSolve in src/core/daily.ts) are over.
// Run every morning by .github/workflows/daily-teaser.yml; Node runs this TypeScript file directly.
//
//   node scripts/daily-teaser.ts              add today's teaser, unless today already has one
//   node scripts/daily-teaser.ts --dry-run    only say what it would do
//   node scripts/daily-teaser.ts --date 2026-11-03
//   node scripts/daily-teaser.ts --extra      add one now, even if today already has a teaser ("a new teaser")
//   node scripts/daily-teaser.ts --exclude brainstellar-1005   never pick these puzzle ids this time
import { randomInt } from 'node:crypto'
import { appendFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import {
  TEASER_TIME_ZONE,
  dateIn,
  nextNumber,
  planDailyTeaser,
  summarize,
  winklerBank,
  type BankPuzzle,
  type DayOff,
  type TeaserSummary,
  type WinklerUse,
} from '../src/core/daily.ts'

const BANK = new URL('../puzzles/brainstellar.json', import.meta.url)
const TEASERS = new URL('../teasers/', import.meta.url)
const DAYS_OFF = new URL('../puzzles/days-off.json', import.meta.url)
const WINKLER_USED = new URL('../puzzles/winkler-used.json', import.meta.url)
// Winkler's puzzles come from a private repository (the texts are from his book, so they stay out of this public
// repo). The Daily teaser workflow checks it out when the WINKLER_TOKEN secret is set; without it, no Winkler.
const WINKLER_BANK = process.env.WINKLER_BANK ?? new URL('../winkler-bank/winkler.json', import.meta.url).pathname

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const extra = args.includes('--extra')
const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : undefined
const date = dateArg ?? dateIn(TEASER_TIME_ZONE, new Date())
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`--date must be YYYY-MM-DD, got "${date}"`)

const publicBank: BankPuzzle[] = JSON.parse(readFileSync(BANK, 'utf8'))
const winklerUsed: WinklerUse[] = JSON.parse(readFileSync(WINKLER_USED, 'utf8'))
const winkler = existsSync(WINKLER_BANK) ? winklerBank(JSON.parse(readFileSync(WINKLER_BANK, 'utf8')), winklerUsed) : []
console.log(winkler.length ? `Winkler puzzles: ${winkler.filter((p) => p.status === 'available').length} available.` : 'No Winkler puzzles (private bank not found).')
const bank = [...publicBank, ...winkler]
const daysOff: DayOff[] = existsSync(DAYS_OFF) ? JSON.parse(readFileSync(DAYS_OFF, 'utf8')) : []
const teaserFiles = readdirSync(TEASERS).filter((name) => /^\d{4}-\d{2}-\d{2}-.*\.md$/.test(name))
const sources = teaserFiles.map((name) => readFileSync(new URL(name, TEASERS), 'utf8'))
const number = nextNumber(sources)
const recent = sources.map(summarize).filter((summary): summary is TeaserSummary => summary !== null)
const exclude = args.includes('--exclude') ? args[args.indexOf('--exclude') + 1].split(',') : []
const plan = planDailyTeaser({
  bank,
  teaserFiles,
  recent,
  exclude,
  number,
  date,
  randomIndex: (count) => randomInt(count),
  extra,
  daysOff,
})

// Tells the workflow whether to commit and deploy.
const output = (key: string, value: string) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`)
}

if (plan.action === 'skip') {
  console.log(`No new teaser: ${plan.reason}.`)
  output('added', 'false')
} else {
  const left = plan.bank.filter((puzzle) => puzzle.status === 'available').length
  console.log(`${dryRun ? 'Would add' : 'Added'} teasers/${plan.fileName}: #${number} "${plan.puzzle.title}" (${plan.puzzle.id}, difficulty ${plan.puzzle.difficulty}). ${left} unused puzzles left.`)
  if (!dryRun) {
    writeFileSync(new URL(plan.fileName, TEASERS), plan.content)
    if (plan.puzzle.source === 'winkler') {
      const teaser = plan.fileName.slice(0, -'.md'.length)
      writeFileSync(WINKLER_USED, `${JSON.stringify([...winklerUsed, { id: plan.puzzle.id, teaser }], null, 2)}\n`)
    } else {
      writeFileSync(BANK, `${JSON.stringify(plan.bank.filter((p) => p.source !== 'winkler'), null, 2)}\n`)
    }
  }
  output('added', dryRun ? 'false' : 'true')
  output('title', plan.puzzle.title)
}
