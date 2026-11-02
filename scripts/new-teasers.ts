// Compares the live site's teasers.json with the one just built and reports the open teasers that are new.
// Used by .github/workflows/deploy.yml before deploying; the notify job announces them afterwards.
//
//   node scripts/new-teasers.ts previous-teasers.json dist/teasers.json
import { appendFileSync, existsSync, readFileSync } from 'node:fs'
import { newOpenTeasers, type ManifestEntry } from '../src/core/notify.ts'

const [previousPath, currentPath] = process.argv.slice(2)
if (!previousPath || !currentPath) throw new Error('usage: node scripts/new-teasers.ts <previous.json> <current.json>')

const read = (path: string): ManifestEntry[] => JSON.parse(readFileSync(path, 'utf8'))
const previous = existsSync(previousPath) ? read(previousPath) : null
const added = newOpenTeasers(previous, read(currentPath))

if (previous === null) console.log('The live site has no teasers.json yet, so nothing is announced this time.')
else console.log(added.length ? `New open teasers: ${added.map((t) => t.title).join(', ')}` : 'No new open teasers.')

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `teasers=${JSON.stringify(added)}\ncount=${added.length}\n`)
}
