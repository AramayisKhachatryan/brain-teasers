// Small shared pieces: links that use the router, rendered markdown, and "who solved it".
import { Check } from 'lucide-react'
import type { MouseEvent, ReactNode } from 'react'
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

/** Archive rows: a pencil tick per solver in their colour. */
export function SolverMarks({ teaser }: { teaser: Teaser }) {
  if (teaser.status === 'open') return <span className="solver solver--none">Still open</span>
  if (teaser.solvedBy.length === 0) return <span className="solver solver--none">Nobody got it</span>
  return (
    <>
      {teaser.solvedBy.map((person) => (
        <span key={person} className={`solver solver--${person}`}>
          <Check aria-hidden="true" />
          {DISPLAY_NAME[person]}
        </span>
      ))}
    </>
  )
}

/** Teaser page: one sentence. */
export function SolvedLine({ teaser }: { teaser: Teaser }) {
  let content: ReactNode
  if (teaser.status === 'open') content = 'Still open'
  else if (teaser.solvedBy.length === 0) content = 'Nobody solved this one'
  else {
    const names = teaser.solvedBy.map((person) => (
      <span key={person} className={`name name--${person}`}>
        {DISPLAY_NAME[person]}
      </span>
    ))
    content = (
      <>
        Solved by {names[0]}
        {names.length > 1 && <> and {names[1]}</>}
      </>
    )
  }
  return <p className="solved-line">{content}</p>
}
