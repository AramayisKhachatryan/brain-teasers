// Turns each teasers/*.md file into a JS module holding the parsed teaser.
// Parsing happens here, at build time: a malformed file stops the build with a clear message,
// and the phone never downloads the markdown or math libraries.
// It also checks the numbering across files (#1, #2, … in date order) and publishes teasers.json
// (slug, number, date, title, status) next to the app: the Deploy workflow compares it with
// the live one to find new teasers to announce.

import path from 'node:path'
import type { Plugin } from 'vite'
import type { ManifestEntry } from '../src/core/notify'
import { numberingProblems, parseTeaserFile } from '../src/core/parse'

export function teasersPlugin(teasersDir: string): Plugin {
  const dir = path.resolve(teasersDir)
  const manifest = new Map<string, ManifestEntry>()
  return {
    name: 'brain-teasers:teasers',
    enforce: 'pre',
    transform(source, id) {
      const file = id.split('?')[0]
      if (path.dirname(file) !== dir || !file.endsWith('.md')) return null
      const teaser = parseTeaserFile(path.basename(file), source)
      manifest.set(teaser.slug, { slug: teaser.slug, number: teaser.number, date: teaser.date, title: teaser.title, status: teaser.status })
      return { code: `export default ${JSON.stringify(teaser)}`, map: null }
    },
    generateBundle() {
      const entries = [...manifest.values()].sort((a, b) => a.number - b.number)
      const problems = numberingProblems(entries)
      if (problems.length) this.error(`Teaser numbers: ${problems.join('; ')}`)
      this.emitFile({ type: 'asset', fileName: 'teasers.json', source: `${JSON.stringify(entries, null, 2)}\n` })
    },
  }
}
