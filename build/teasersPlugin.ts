// Turns each teasers/*.md file into a JS module holding the parsed teaser.
// Parsing happens here, at build time: a malformed file stops the build with a clear message,
// and the phone never downloads the markdown or math libraries.

import path from 'node:path'
import type { Plugin } from 'vite'
import { parseTeaserFile } from '../src/core/parse'

export function teasersPlugin(teasersDir: string): Plugin {
  const dir = path.resolve(teasersDir)
  return {
    name: 'brain-teasers:teasers',
    enforce: 'pre',
    transform(source, id) {
      const file = id.split('?')[0]
      if (path.dirname(file) !== dir || !file.endsWith('.md')) return null
      const teaser = parseTeaserFile(path.basename(file), source)
      return { code: `export default ${JSON.stringify(teaser)}`, map: null }
    },
  }
}
