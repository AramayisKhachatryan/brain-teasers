// Every teasers/*.md file, bundled at build time by build/teasersPlugin.ts.
// `@teasers` is teasers/ (see vite.config.ts; screenshot runs swap in test fixtures).
import type { Teaser } from './core/teaser'

const modules = import.meta.glob<Teaser>(['@teasers/*.md', '!@teasers/README.md'], {
  eager: true,
  import: 'default',
})

/** In order: #1 first. */
export const teasers: readonly Teaser[] = Object.values(modules).sort((a, b) => a.number - b.number)
