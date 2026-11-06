import { PEOPLE, type Person, type Teaser } from './teaser'

export type Score = Record<Person, number>

/** Each person in `solved_by` of a solved teaser gets as many points as its difficulty (1–10). */
export function computeScore(teasers: readonly Teaser[]): Score {
  const score = Object.fromEntries(PEOPLE.map((person) => [person, 0])) as Score
  for (const teaser of teasers) {
    if (teaser.status !== 'solved') continue
    for (const person of teaser.solvedBy) score[person] += teaser.difficulty
  }
  return score
}
