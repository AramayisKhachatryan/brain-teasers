import { CalendarArrowDown, CalendarArrowUp, Search, X } from 'lucide-react'
import { useRef, type FormEvent } from 'react'
import { DEFAULT_VIEW, isFiltered, viewArchive, type ArchiveView, type SolverFilter } from '../core/archive'
import { monthLabel } from '../core/dates'
import { DISPLAY_NAME, type Teaser } from '../core/teaser'
import { TeaserRow } from './bits'

const SOLVER_CHOICES: { value: SolverFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'aramayis', label: 'Aramayis' },
  { value: 'armen', label: 'Armen' },
  { value: 'both', label: 'Both' },
]

export function ArchiveScreen(props: {
  teasers: Teaser[]
  view: ArchiveView
  onViewChange: (view: ArchiveView) => void
}) {
  const { view, onViewChange } = props
  const searchRef = useRef<HTMLInputElement>(null)
  const shown = viewArchive(props.teasers, view)
  const update = (changes: Partial<ArchiveView>) => onViewChange({ ...view, ...changes })

  // The keyboard's Search key just closes the keyboard: results already update while typing.
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    searchRef.current?.blur()
  }

  const months: { label: string; teasers: Teaser[] }[] = []
  for (const teaser of shown) {
    const label = monthLabel(teaser.date)
    if (months.at(-1)?.label !== label) months.push({ label, teasers: [] })
    months.at(-1)!.teasers.push(teaser)
  }

  return (
    <main className="screen screen--archive">
      <h1 className="screen__title">Archive</h1>

      {props.teasers.length === 0 ? (
        <p className="empty__text">
          Finished teasers land here, with the hints you asked for and the full solution.
        </p>
      ) : (
        <>
          <div className="finder">
            <form className="finder__row" role="search" onSubmit={onSubmit}>
              <label className="search">
                <Search className="search__icon" aria-hidden="true" />
                <span className="visually-hidden">Search titles</span>
                <input
                  ref={searchRef}
                  className="search__input"
                  type="search"
                  placeholder="Search titles"
                  value={view.query}
                  onChange={(event) => update({ query: event.target.value })}
                  enterKeyHint="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                {view.query !== '' && (
                  <button
                    type="button"
                    className="search__clear tappable"
                    aria-label="Clear search"
                    onClick={() => {
                      update({ query: '' })
                      searchRef.current?.focus()
                    }}
                  >
                    <X aria-hidden="true" />
                  </button>
                )}
              </label>
              <button
                type="button"
                className="sort tappable"
                onClick={() => update({ order: view.order === 'newest' ? 'oldest' : 'newest' })}
              >
                {view.order === 'newest' ? <CalendarArrowDown aria-hidden="true" /> : <CalendarArrowUp aria-hidden="true" />}
                <span className="visually-hidden">Sorted </span>
                {/* Both labels take up space, so the button keeps one width and the search field doesn't move. */}
                <span className="sort__labels">
                  <span className={view.order === 'newest' ? undefined : 'is-hidden'}>Newest first</span>
                  <span className={view.order === 'oldest' ? undefined : 'is-hidden'}>Oldest first</span>
                </span>
              </button>
            </form>

            <div className="chips" role="radiogroup" aria-label="Solved by">
              {SOLVER_CHOICES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={view.solver === value}
                  className={`chip chip--${value} tappable`}
                  onClick={() => update({ solver: value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="finder__count" aria-live="polite">
            {isFiltered(view) && shown.length > 0 && `${shown.length} of ${props.teasers.length} teasers`}
          </p>

          {shown.length === 0 && <NoMatches view={view} onShowAll={() => onViewChange({ ...DEFAULT_VIEW, order: view.order })} />}
        </>
      )}

      {months.map((month) => (
        <section key={month.label} className="archive__month">
          <h2 className="archive__month-label">{month.label}</h2>
          <ul className="archive__list">
            {month.teasers.map((teaser) => (
              <li key={teaser.slug}>
                <TeaserRow teaser={teaser} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}

function NoMatches({ view, onShowAll }: { view: ArchiveView; onShowAll: () => void }) {
  const query = view.query.trim()
  const who =
    view.solver === 'all' ? '' : view.solver === 'both' ? 'solved by both of you' : `solved by ${DISPLAY_NAME[view.solver]}`
  let message: string
  if (query && who) message = `No teasers ${who} have “${query}” in the title.`
  else if (query) message = `No titles have “${query}” in them.`
  else message = `No teasers ${who} yet.`

  return (
    <div className="no-matches">
      <p className="empty__text">{message}</p>
      <button type="button" className="no-matches__reset tappable" onClick={onShowAll}>
        Show all teasers
      </button>
    </div>
  )
}
