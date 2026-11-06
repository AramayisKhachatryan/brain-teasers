// Numbers for the Stats screen. Plain TypeScript, no React. Only finished teasers (status: solved, including the
// ones nobody got) count; open teasers are still in play.
import { daysBetween } from './dates'
import { bandOf, type Band } from './daily'
import { PEOPLE, type Person, type Teaser } from './teaser'

/** Running points after each day something was finished: one point per date, both people. */
export interface PointsDay {
  date: string
  points: Record<Person, number>
  /** The teasers finished that day, in number order. */
  finished: Teaser[]
}

export interface PersonStats {
  points: number
  solved: number
  /** Share of finished teasers solved, 0–1 (0 when nothing is finished). */
  rate: number
  /** Finished teasers in a row this person solved, counting back from the latest. */
  streak: number
  bestStreak: number
  /** Highest difficulty solved, or null. */
  hardest: Teaser | null
  /** Mean difficulty of the teasers solved, or null. */
  averageDifficulty: number | null
  /** Solved alone: the other person didn't get it. */
  solo: number
}

export interface BandStats {
  band: Band
  finished: number
  solved: Record<Person, number>
}

export interface Stats {
  finished: number
  open: number
  together: number
  nobody: number
  /** Mean days spent per finished teaser, counting the day it was given (finished the same day = 1); null if none. */
  averageDays: number | null
  hints: number
  people: Record<Person, PersonStats>
  timeline: PointsDay[]
  bands: BandStats[]
}

const byNumber = (a: Teaser, b: Teaser) => a.number - b.number

/** When a teaser was finished: `solved_on`, or the day it was given. */
export function finishedOn(teaser: Teaser): string {
  return teaser.solvedOn ?? teaser.date
}

export function pointsTimeline(teasers: readonly Teaser[]): PointsDay[] {
  const finished = teasers.filter((teaser) => teaser.status === 'solved').sort(byNumber)
  const dates = [...new Set(finished.map(finishedOn))].sort()
  const running = Object.fromEntries(PEOPLE.map((person) => [person, 0])) as Record<Person, number>
  return dates.map((date) => {
    const that = finished.filter((teaser) => finishedOn(teaser) === date)
    for (const teaser of that) for (const person of teaser.solvedBy) running[person] += teaser.difficulty
    return { date, points: { ...running }, finished: that }
  })
}

function personStats(finished: readonly Teaser[], person: Person): PersonStats {
  const solvedList = finished.filter((teaser) => teaser.solvedBy.includes(person))
  let run = 0
  let best = 0
  for (const teaser of finished) {
    run = teaser.solvedBy.includes(person) ? run + 1 : 0
    best = Math.max(best, run)
  }
  let streak = 0
  for (let i = finished.length - 1; i >= 0 && finished[i].solvedBy.includes(person); i--) streak++
  const hardest = solvedList.reduce<Teaser | null>(
    (top, teaser) => (top === null || teaser.difficulty > top.difficulty ? teaser : top),
    null,
  )
  const points = solvedList.reduce((sum, teaser) => sum + teaser.difficulty, 0)
  return {
    points,
    solved: solvedList.length,
    rate: finished.length ? solvedList.length / finished.length : 0,
    streak,
    bestStreak: best,
    hardest,
    averageDifficulty: solvedList.length ? points / solvedList.length : null,
    solo: solvedList.filter((teaser) => teaser.solvedBy.length === 1).length,
  }
}

export function computeStats(teasers: readonly Teaser[]): Stats {
  const finished = teasers.filter((teaser) => teaser.status === 'solved').sort(byNumber)
  const people = Object.fromEntries(PEOPLE.map((person) => [person, personStats(finished, person)])) as Record<
    Person,
    PersonStats
  >
  const bands = (['easy', 'medium', 'hard'] as const).map((band) => {
    const inBand = finished.filter((teaser) => bandOf(teaser.difficulty) === band)
    const solved = Object.fromEntries(
      PEOPLE.map((person) => [person, inBand.filter((teaser) => teaser.solvedBy.includes(person)).length]),
    ) as Record<Person, number>
    return { band, finished: inBand.length, solved }
  })
  return {
    finished: finished.length,
    open: teasers.length - finished.length,
    together: finished.filter((teaser) => teaser.solvedBy.length === PEOPLE.length).length,
    nobody: finished.filter((teaser) => teaser.solvedBy.length === 0).length,
    averageDays: finished.length
      ? finished.reduce((sum, teaser) => sum + daysBetween(teaser.date, finishedOn(teaser)) + 1, 0) / finished.length
      : null,
    hints: finished.reduce((sum, teaser) => sum + teaser.hintCount, 0),
    people,
    timeline: pointsTimeline(teasers),
    bands,
  }
}
