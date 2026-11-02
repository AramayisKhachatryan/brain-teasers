// Adds today's teaser (Armenian date) from the puzzle bank and marks the puzzle as used.
// Run every morning by .github/workflows/daily-teaser.yml; Node runs this TypeScript file directly.
//
//   node scripts/daily-teaser.ts              add today's teaser, unless today already has one
//   node scripts/daily-teaser.ts --dry-run    only say what it would do
//   node scripts/daily-teaser.ts --date 2026-11-03
//   node scripts/daily-teaser.ts --extra      add one even if today already has a teaser ("another teaser")
import { randomInt } from 'node:crypto'
import { appendFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { TEASER_TIME_ZONE, dateIn, planDailyTeaser, type BankPuzzle } from '../src/core/daily.ts'

const BANK = new URL('../puzzles/brainstellar.json', import.meta.url)
const TEASERS = new URL('../teasers/', import.meta.url)

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const extra = args.includes('--extra')
const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : undefined
const date = dateArg ?? dateIn(TEASER_TIME_ZONE, new Date())
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`--date must be YYYY-MM-DD, got "${date}"`)

const bank: BankPuzzle[] = JSON.parse(readFileSync(BANK, 'utf8'))
const plan = planDailyTeaser({
  bank,
  teaserFiles: readdirSync(TEASERS).filter((name) => name.endsWith('.md')),
  date,
  randomIndex: (count) => randomInt(count),
  extra,
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
  console.log(`${dryRun ? 'Would add' : 'Added'} teasers/${plan.fileName}: "${plan.puzzle.title}" (${plan.puzzle.id}). ${left} unused puzzles left.`)
  if (!dryRun) {
    writeFileSync(new URL(plan.fileName, TEASERS), plan.content)
    writeFileSync(BANK, `${JSON.stringify(plan.bank, null, 2)}\n`)
  }
  output('added', dryRun ? 'false' : 'true')
  output('title', plan.puzzle.title)
}
