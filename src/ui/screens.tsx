import { ChevronLeft } from 'lucide-react'
import { fullDate, longDate } from '../core/dates'
import { cameFrom, goBack, type Route } from '../core/router'
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

const BACK_LABEL: Record<Exclude<Route['name'], 'teaser'>, string> = {
  home: 'Current',
  calendar: 'Calendar',
  archive: 'Archive',
}

export function TeaserScreen({ teaser }: { teaser: Teaser | undefined }) {
  // Back returns to the screen this teaser was opened from; after a direct link, to the Archive.
  const from = cameFrom()
  const backTo: Exclude<Route, { name: 'teaser' }> = from && from.name !== 'teaser' ? from : { name: 'archive' }
  const back = (
    <button type="button" className="back tappable" onClick={() => goBack(backTo)}>
      <ChevronLeft aria-hidden="true" />
      {BACK_LABEL[backTo.name]}
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
