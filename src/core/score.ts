import { PEOPLE, type Person, type Teaser } from './teaser'

export type Score = Record<Person, number>

/** How many teasers each person has solved (any difficulty). */
export function computeSolved(teasers: readonly Teaser[]): Score {
  const solved = Object.fromEntries(PEOPLE.map((person) => [person, 0])) as Score
  for (const teaser of teasers) {
    if (teaser.status !== 'solved') continue
    for (const person of teaser.solvedBy) solved[person] += 1
  }
  return solved
}

/** What one solver earns for a teaser: its `points:` if set by hand, otherwise its difficulty. */
export function pointsFor(teaser: Pick<Teaser, 'difficulty' | 'points'>): number {
  return teaser.points ?? teaser.difficulty
}

/** Each person in `solved_by` of a solved teaser gets pointsFor(teaser): normally its difficulty (1–10). */
export function computeScore(teasers: readonly Teaser[]): Score {
  const score = Object.fromEntries(PEOPLE.map((person) => [person, 0])) as Score
  for (const teaser of teasers) {
    if (teaser.status !== 'solved') continue
    for (const person of teaser.solvedBy) score[person] += pointsFor(teaser)
  }
  return score
}
