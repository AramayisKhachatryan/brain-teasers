// Checks every real file in teasers/. The build also parses them, so a typo can't reach the live app.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { FILE_NAME, parseTeaserFile } from '../src/core/parse'

const dir = fileURLToPath(new URL('../teasers/', import.meta.url))
const files = readdirSync(dir).filter((name) => name !== 'README.md')

describe('teasers/', () => {
  it('holds only teaser files named YYYY-MM-DD-short-name.md', () => {
    expect(files.filter((name) => !FILE_NAME.test(name))).toEqual([])
  })

  it.each(files)('%s is a valid teaser', (name) => {
    expect(() => parseTeaserFile(name, readFileSync(dir + name, 'utf8'))).not.toThrow()
  })
})

describe('tests/fixtures/ (screenshot data)', () => {
  const root = fileURLToPath(new URL('./fixtures/', import.meta.url))
  const fixtures = readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => readdirSync(root + entry.name).map((name) => [entry.name, name]))

  it.each(fixtures)('%s/%s is a valid teaser', (folder, name) => {
    expect(() => parseTeaserFile(name, readFileSync(`${root}${folder}/${name}`, 'utf8'))).not.toThrow()
  })
})
