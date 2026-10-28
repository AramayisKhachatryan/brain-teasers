import { ChevronDown } from 'lucide-react'
import { useId, useState } from 'react'
import { Prose } from './bits'

/** A section that stays folded until tapped, so hints and the solution are never seen by accident. */
export function Fold(props: { label: string; meta?: string; html: string }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  return (
    <section className={`fold${open ? ' is-open' : ''}`}>
      <h2 className="fold__heading">
        <button
          type="button"
          className="fold__toggle tappable"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="fold__label">{props.label}</span>
          {props.meta && <span className="fold__meta">{props.meta}</span>}
          <ChevronDown className="fold__chevron" aria-hidden="true" />
        </button>
      </h2>
      <div className="fold__panel" id={panelId} inert={!open}>
        <div className="fold__inner">
          <Prose html={props.html} />
        </div>
      </div>
    </section>
  )
}
