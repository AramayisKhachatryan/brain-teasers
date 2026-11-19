// Small shared pieces: links that use the router, rendered markdown, and "who solved it".
import { Check, ChevronRight, Hourglass } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import { daysToSolve } from '../core/daily'
import { pointsFor } from '../core/score'
import { daysBetween, monthLabel, shortDate } from '../core/dates'
import { hrefFor, navigate, type Route } from '../core/router'
import { DISPLAY_NAME, type Teaser } from '../core/teaser'

export function Link(props: { to: Route; className?: string; children: ReactNode; ariaLabel?: string }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    navigate(props.to)
  }
  return (
    <a href={hrefFor(props.to)} className={props.className} onClick={onClick} aria-label={props.ariaLabel}>
      {props.children}
    </a>
  )
}

/** HTML rendered at build time from our own markdown files. */
export function Prose(props: { html: string; className?: string }) {
  return <div className={`prose ${props.className ?? ''}`} dangerouslySetInnerHTML={{ __html: props.html }} />
}

/** Days a solved teaser took, when its `solved_on` date is known. */
function daysTaken(teaser: Teaser): number | null {
  return teaser.status === 'solved' && teaser.solvedOn ? daysBetween(teaser.date, teaser.solvedOn) : null
}

function dayCount(days: number): string {
  return days === 1 ? '1 day' : `${days} days`
}

/** Archive rows: a pencil tick per solver in their colour, and how long it took if more than a day. */
export function SolverMarks({ teaser }: { teaser: Teaser }) {
  if (teaser.status === 'open') return <span className="solver solver--none">Still open</span>
  const days = daysTaken(teaser)
  return (
    <>
      {teaser.solvedBy.length === 0 && <span className="solver solver--none">Nobody got it</span>}
      {teaser.solvedBy.map((person) => (
        <span key={person} className={`solver solver--${person}`}>
          <Check aria-hidden="true" />
          {DISPLAY_NAME[person]}
        </span>
      ))}
      {days !== null && days > 0 && (
        <span className="solver solver--none" aria-label={`took ${dayCount(days)}`}>
          <Hourglass aria-hidden="true" />
          {dayCount(days)}
        </span>
      )}
    </>
  )
}

/** "#11 Parking lot": the number in pencil grey, kept on one line with the first word of the title. */
export function TeaserTitle({ teaser }: { teaser: Teaser }) {
  return (
    <>
      <span className="teaser-number">#{teaser.number}</span>
      {'\u00a0'}
      {teaser.title}
    </>
  )
}

/** "Jane Street · February 2020": where a puzzle comes from, when that's worth a tag. */
export function SourceTag({ teaser, short = false }: { teaser: Teaser; short?: boolean }) {
  if (!teaser.janeStreet) return null
  const month = monthLabel(`${teaser.janeStreet}-01`)
  return (
    <span className="source-tag" title={`Jane Street puzzle of ${month}`}>
      Jane Street
      <span className="source-tag__month">{short ? month.replace(/^(\w{3})\w*/, '$1') : month}</span>
    </span>
  )
}

/** One teaser in a list (Archive, and a day with several teasers in the Calendar). */
export function TeaserRow({ teaser }: { teaser: Teaser }) {
  return (
    <Link to={{ name: 'teaser', slug: teaser.slug }} className="row tappable">
      <span className="row__date">{shortDate(teaser.date)}</span>
      <span className="row__body">
        <span className="row__title">
          <TeaserTitle teaser={teaser} />
        </span>
        <span className="row__solvers">
          <SourceTag teaser={teaser} short />
          <SolverMarks teaser={teaser} />
        </span>
      </span>
      <span className="row__difficulty" aria-label={`difficulty ${teaser.difficulty} of 10`} title="Difficulty">
        {teaser.difficulty}
      </span>
      <ChevronRight className="row__chevron" aria-hidden="true" />
    </Link>
  )
}

/** "Difficulty 6 of 10 · 3 days to solve" while open; "Difficulty 6 of 10 · 6 points" once finished
 * ("3 points (of 6)" when the points were set lower by hand, e.g. after hints). */
export function DifficultyLine({ teaser }: { teaser: Teaser }) {
  const d = teaser.difficulty
  const days = teaser.days ?? daysToSolve(d)
  const p = pointsFor(teaser)
  const pts = `${p === 1 ? '1 point' : `${p} points`}${p !== d ? ` (of ${d})` : ''}`
  const rest = teaser.status === 'open' ? (days === 1 ? '1 day to solve' : `${days} days to solve`) : pts
  return (
    <p className="meta-line">
      Difficulty {d} of 10 · {rest}
    </p>
  )
}

/** Teaser page: one sentence. */
export function SolvedLine({ teaser }: { teaser: Teaser }) {
  const days = daysTaken(teaser)
  let content: ReactNode
  if (teaser.status === 'open') content = 'Still open'
  else if (teaser.solvedBy.length === 0) {
    content = days ? `Nobody solved this one in ${dayCount(days)}` : 'Nobody solved this one'
  } else {
    const names = teaser.solvedBy.map((person) => (
      <span key={person} className={`name name--${person}`}>
        {DISPLAY_NAME[person]}
      </span>
    ))
    // "on day 6 of 10": which day of the days to solve it took, counting the day it was given as day 1.
    const given = teaser.days ?? daysToSolve(teaser.difficulty)
    const day = days === null ? null : days + 1
    const when = day === null ? '' : day === 1 ? ' the same day' : ` on day ${day}${day <= given ? ` of ${given}` : ''}`
    content = (
      <>
        Solved by {names[0]}
        {names.length > 1 && <> and {names[1]}</>}
        {when}
      </>
    )
  }
  return <p className="meta-line">{content}</p>
}
