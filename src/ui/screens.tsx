import { ChevronLeft, ChevronRight } from 'lucide-react'
import { longDate, fullDate, monthLabel, shortDate } from '../core/dates'
import { goBack } from '../core/router'
import type { Score } from '../core/score'
import type { Teaser } from '../core/teaser'
import { Link, Prose, SolvedLine, SolverMarks } from './bits'
import { Fold } from './Fold'
import { ScoreBoard } from './ScoreBoard'

export function HomeScreen(props: { current: Teaser | null; lastSolved: Teaser | null; score: Score }) {
  const { current, lastSolved } = props
  return (
    <main className="screen screen--home">
      <ScoreBoard score={props.score} />
      {current ? (
        <article className="teaser">
          <p className="teaser__date">{longDate(current.date)}</p>
          <h1 className="teaser__title">{current.title}</h1>
          <Prose html={current.problem} className="problem" />
          <p className="nudge">Stuck? Ask Claude for a hint.</p>
        </article>
      ) : (
        <div className="empty">
          <h1 className="empty__title">Nothing to solve right now</h1>
          <p className="empty__text">Ask Claude for a new teaser. It shows up here once it’s published.</p>
          {lastSolved && (
            <Link to={{ name: 'teaser', slug: lastSolved.slug }} className="empty__last tappable">
              <span className="empty__last-label">Last one</span>
              <span className="empty__last-title">{lastSolved.title}</span>
              <span className="row__solvers">
                <SolverMarks teaser={lastSolved} />
              </span>
            </Link>
          )}
        </div>
      )}
    </main>
  )
}

export function ArchiveScreen({ teasers }: { teasers: Teaser[] }) {
  const months: { label: string; teasers: Teaser[] }[] = []
  for (const teaser of teasers) {
    const label = monthLabel(teaser.date)
    if (months.at(-1)?.label !== label) months.push({ label, teasers: [] })
    months.at(-1)!.teasers.push(teaser)
  }

  return (
    <main className="screen screen--archive">
      <h1 className="screen__title">Archive</h1>
      {months.length === 0 && (
        <p className="empty__text">
          Finished teasers land here, with the hints you asked for and the full solution.
        </p>
      )}
      {months.map((month) => (
        <section key={month.label} className="archive__month">
          <h2 className="archive__month-label">{month.label}</h2>
          <ul className="archive__list">
            {month.teasers.map((teaser) => (
              <li key={teaser.slug}>
                <Link to={{ name: 'teaser', slug: teaser.slug }} className="row tappable">
                  <span className="row__date">{shortDate(teaser.date)}</span>
                  <span className="row__body">
                    <span className="row__title">{teaser.title}</span>
                    <span className="row__solvers">
                      <SolverMarks teaser={teaser} />
                    </span>
                  </span>
                  <ChevronRight className="row__chevron" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}

export function TeaserScreen({ teaser }: { teaser: Teaser | undefined }) {
  const back = (
    <button type="button" className="back tappable" onClick={() => goBack({ name: 'archive' })}>
      <ChevronLeft aria-hidden="true" />
      Archive
    </button>
  )

  if (!teaser) {
    return (
      <main className="screen screen--push">
        {back}
        <div className="empty">
          <h1 className="empty__title">This teaser isn’t here</h1>
          <p className="empty__text">The link may be old. Everything we’ve done is in the archive.</p>
        </div>
      </main>
    )
  }

  const hintMeta = teaser.hintCount > 0 ? String(teaser.hintCount) : undefined
  return (
    <main className="screen screen--push">
      {back}
      <article className="teaser teaser--page">
        <p className="teaser__date">{fullDate(teaser.date)}</p>
        <h1 className="teaser__title">{teaser.title}</h1>
        <SolvedLine teaser={teaser} />
        <Prose html={teaser.problem} className="problem" />
      </article>
      {(teaser.hints || teaser.solution || teaser.notes) && (
        <div className="folds">
          {teaser.hints && <Fold label="Hints" meta={hintMeta} html={teaser.hints} />}
          {teaser.solution && <Fold label="Solution" html={teaser.solution} />}
          {teaser.notes && <Fold label="Notes" html={teaser.notes} />}
        </div>
      )}
    </main>
  )
}
