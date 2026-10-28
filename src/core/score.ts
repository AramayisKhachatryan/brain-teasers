import { PEOPLE, type Person, type Teaser } from './teaser'

export type Score = Record<Person, number>

/** One point per person listed in `solved_by` of every solved teaser. */
export function computeScore(teasers: readonly Teaser[]): Score {
  const score = Object.fromEntries(PEOPLE.map((person) => [person, 0])) as Score
  for (const teaser of teasers) {
    if (teaser.status !== 'solved') continue
    for (const person of teaser.solvedBy) score[person] += 1
  }
  return score
}
