import type { ReactNode } from 'react'
import { daysBetween, shortDate } from '../core/dates'
import type { Band } from '../core/daily'
import type { Stats } from '../core/stats'
import { DISPLAY_NAME, PEOPLE, numberedTitle, type Person } from '../core/teaser'
import { PointsChart } from './PointsChart'

const BAND_LABEL: Record<Band, string> = { easy: 'Easy (1–3)', medium: 'Medium (4–5)', hard: 'Hard (6+)' }

const percent = (share: number) => `${Math.round(share * 100)}%`
const oneDecimal = (value: number | null) => (value === null ? '–' : value.toFixed(1).replace(/\.0$/, ''))
const days = (n: number) => (n === 1 ? '1 day' : `${n} days`)

/** One row of the head-to-head table; the higher number is set heavier. */
function Duel(props: { label: string; values: Record<Person, number | null>; show?: (value: number) => ReactNode; note?: string }) {
  const { values, show = (value) => value } = props
  const [a, b] = PEOPLE.map((person) => values[person])
  const lead: Person | null = a === null || b === null || a === b ? null : a > b ? 'aramayis' : 'armen'
  return (
    <tr>
      <th scope="row">
        {props.label}
        {props.note && <span className="duel__note">{props.note}</span>}
      </th>
      {PEOPLE.map((person) => (
        <td key={person} className={lead === person ? 'duel__lead' : undefined}>
          {values[person] === null ? '–' : show(values[person] as number)}
        </td>
      ))}
    </tr>
  )
}

function Tile(props: { value: ReactNode; label: string }) {
  return (
    <div className="tile">
      <span className="tile__value">{props.value}</span>
      <span className="tile__label">{props.label}</span>
    </div>
  )
}

export function StatsScreen({ stats }: { stats: Stats }) {
  const { people } = stats
  const per = <K extends keyof (typeof people)['aramayis']>(key: K) =>
    Object.fromEntries(PEOPLE.map((person) => [person, people[person][key]])) as Record<Person, (typeof people)['aramayis'][K]>
  const first = stats.timeline[0]?.date
  const last = stats.timeline.at(-1)?.date

  return (
    <main className="screen screen--stats">
      <h1 className="screen__title">Stats</h1>
      <p className="stats-intro">
        {stats.finished === 0
          ? 'Numbers appear here once a teaser is finished.'
          : `${stats.finished} teasers finished${first && last && first !== last ? ` in ${days(daysBetween(first, last) + 1)}` : ''}. Points are the difficulty of each teaser solved.`}
      </p>

      {stats.timeline.length > 0 && (
        <section className="stats-section" aria-labelledby="stats-points">
          <h2 className="stats-section__title" id="stats-points">
            Points over time
          </h2>
          <PointsChart timeline={stats.timeline} />
        </section>
      )}

      <section className="stats-section" aria-labelledby="stats-duel">
        <h2 className="stats-section__title" id="stats-duel">
          Head to head
        </h2>
        <table className="duel">
          <thead>
            <tr>
              <td />
              {PEOPLE.map((person) => (
                <th key={person} scope="col" className={`name name--${person}`}>
                  {DISPLAY_NAME[person]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Duel label="Points" values={per('points')} />
            <Duel label="Solved" values={per('solved')} show={(v) => `${v} of ${stats.finished}`} />
            <Duel label="Solve rate" values={per('rate')} show={percent} />
            <Duel label="Current streak" note="solved in a row, up to now" values={per('streak')} />
            <Duel label="Best streak" values={per('bestStreak')} />
            <Duel label="Solved alone" note="the other didn’t get it" values={per('solo')} />
            <Duel label="Average difficulty" note="of the ones solved" values={per('averageDifficulty')} show={oneDecimal} />
            <Duel
              label="Hardest solved"
              values={Object.fromEntries(PEOPLE.map((p) => [p, people[p].hardest?.difficulty ?? null])) as Record<Person, number | null>}
              show={(v) => `${v} of 10`}
            />
          </tbody>
        </table>
        <ul className="hardest">
          {PEOPLE.map((person) => {
            const teaser = people[person].hardest
            return teaser ? (
              <li key={person}>
                <span className={`name name--${person}`}>{DISPLAY_NAME[person]}</span>’s hardest: {numberedTitle(teaser)}
              </li>
            ) : null
          })}
        </ul>
      </section>

      <section className="stats-section" aria-labelledby="stats-together">
        <h2 className="stats-section__title" id="stats-together">
          Together
        </h2>
        <div className="tiles">
          <Tile value={stats.together} label="solved by both" />
          <Tile value={stats.nobody} label="nobody got" />
          <Tile value={stats.averageDays === null ? '–' : oneDecimal(stats.averageDays)} label="days per teaser, on average" />
          <Tile value={stats.hints} label="hints asked" />
        </div>
      </section>

      <section className="stats-section" aria-labelledby="stats-bands">
        <h2 className="stats-section__title" id="stats-bands">
          By difficulty
        </h2>
        <div className="bands">
          {stats.bands.map(({ band, finished, solved }) => (
            <div className="band" key={band}>
              <p className="band__label">
                {BAND_LABEL[band]}
                <span className="band__count">{finished === 1 ? '1 finished' : `${finished} finished`}</span>
              </p>
              {PEOPLE.map((person) => {
                const share = finished ? solved[person] / finished : 0
                return (
                  <div className="band__row" key={person}>
                    <span className={`band__name name name--${person}`}>{DISPLAY_NAME[person]}</span>
                    <span className="band__track" aria-hidden="true">
                      <span className={`band__bar band__bar--${person}`} style={{ width: `${share * 100}%` }} />
                    </span>
                    <span className="band__value">{finished ? `${solved[person]} of ${finished}` : '–'}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>

      <p className="stats-foot">Last finished {last ? shortDate(last) : '–'}. Open teasers count once they’re finished.</p>
    </main>
  )
}
