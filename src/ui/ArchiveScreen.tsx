import { ArrowDownWideNarrow, ArrowUpNarrowWide, CalendarArrowDown, CalendarArrowUp, Search, X, type LucideIcon } from 'lucide-react'
import { useRef, type FormEvent } from 'react'
import { DEFAULT_VIEW, isFiltered, viewArchive, type ArchiveView, type SolverFilter, type SortOrder } from '../core/archive'
import { monthLabel } from '../core/dates'
import { DISPLAY_NAME, type Teaser } from '../core/teaser'
import { TeaserRow } from './bits'

// No chip selected shows every teaser; tapping the selected chip again clears it.
const SOLVER_CHOICES: { value: Exclude<SolverFilter, 'all'>; label: string }[] = [
  { value: 'aramayis', label: 'Aramayis' },
  { value: 'armen', label: 'Armen' },
  { value: 'both', label: 'Both' },
  { value: 'nobody', label: 'Nobody' },
]

const SORTS: { value: SortOrder; label: string; Icon: LucideIcon }[] = [
  { value: 'newest', label: 'Newest first', Icon: CalendarArrowDown },
  { value: 'oldest', label: 'Oldest first', Icon: CalendarArrowUp },
  { value: 'hardest', label: 'Hardest first', Icon: ArrowDownWideNarrow },
  { value: 'easiest', label: 'Easiest first', Icon: ArrowUpNarrowWide },
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
  // Clears the search and the filter, keeping the order.
  const showAll = () => onViewChange({ ...DEFAULT_VIEW, order: view.order })

  // The keyboard's Search key just closes the keyboard: results already update while typing.
  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    searchRef.current?.blur()
  }

  // Grouped by month when sorted by date, by difficulty when sorted by difficulty.
  const byDifficulty = view.order === 'hardest' || view.order === 'easiest'
  const groups: { label: string; teasers: Teaser[] }[] = []
  for (const teaser of shown) {
    const label = byDifficulty ? `Difficulty ${teaser.difficulty}` : monthLabel(teaser.date)
    if (groups.at(-1)?.label !== label) groups.push({ label, teasers: [] })
    groups.at(-1)!.teasers.push(teaser)
  }
  const sort = SORTS.find((option) => option.value === view.order) ?? SORTS[0]

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
                <span className="visually-hidden">Search by title or number</span>
                <input
                  ref={searchRef}
                  className="search__input"
                  type="search"
                  placeholder="Title or #"
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
              {/* A native picker under the button's look: on the iPhone it opens the system wheel. */}
              <label className="sort tappable">
                <sort.Icon aria-hidden="true" />
                {/* All labels take up space, so the button keeps one width and the search field doesn't move. */}
                <span className="sort__labels" aria-hidden="true">
                  {SORTS.map((option) => (
                    <span key={option.value} className={option.value === view.order ? undefined : 'is-hidden'}>
                      {option.label}
                    </span>
                  ))}
                </span>
                <select
                  className="sort__select"
                  aria-label="Sort"
                  value={view.order}
                  onChange={(event) => update({ order: event.target.value as SortOrder })}
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </form>

            <div className="chips" role="group" aria-label="Solved by">
              {SOLVER_CHOICES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={view.solver === value}
                  className={`chip chip--${value} tappable`}
                  onClick={() => update({ solver: view.solver === value ? 'all' : value })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="finder__count">
            <p aria-live="polite">
              {isFiltered(view) && shown.length > 0 && `${shown.length} of ${props.teasers.length} teasers`}
            </p>
            {isFiltered(view) && shown.length > 0 && (
              <button type="button" className="finder__show-all tappable" onClick={showAll}>
                Show all
              </button>
            )}
          </div>

          {shown.length === 0 && <NoMatches view={view} onShowAll={showAll} />}
        </>
      )}

      {groups.map((group) => (
        <section key={group.label} className="archive__month">
          <h2 className="archive__month-label">{group.label}</h2>
          <ul className="archive__list">
            {group.teasers.map((teaser) => (
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
  const which: Record<Exclude<SolverFilter, 'all'>, string> = {
    aramayis: `teasers solved by ${DISPLAY_NAME.aramayis}`,
    armen: `teasers solved by ${DISPLAY_NAME.armen}`,
    both: 'teasers solved by both of you',
    nobody: 'teasers that nobody solved',
  }
  let message: string
  if (view.solver === 'all') message = `Nothing matches “${query}”.`
  else if (query) message = `No ${which[view.solver]} match “${query}”.`
  else if (view.solver === 'nobody') message = 'At least one of you has solved every teaser so far.'
  else message = `No ${which[view.solver]} yet.`

  return (
    <div className="no-matches">
      <p className="empty__text">{message}</p>
      <button type="button" className="no-matches__reset tappable" onClick={onShowAll}>
        Show all teasers
      </button>
    </div>
  )
}
