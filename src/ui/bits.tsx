// Small shared pieces: links that use the router, rendered markdown, and "who solved it".
import { Check, ChevronRight, Hourglass } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
import { daysBetween, shortDate } from '../core/dates'
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

/** One teaser in a list (Archive, and a day with several teasers in the Calendar). */
export function TeaserRow({ teaser }: { teaser: Teaser }) {
  return (
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
    const when = days === null ? '' : days === 0 ? ' the same day' : days === 1 ? ' a day later' : ` ${days} days later`
    content = (
      <>
        Solved by {names[0]}
        {names.length > 1 && <> and {names[1]}</>}
        {when}
      </>
    )
  }
  return <p className="solved-line">{content}</p>
}
