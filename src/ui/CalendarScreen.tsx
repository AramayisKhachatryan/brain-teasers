import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { addMonths, monthRange, monthWeeks, teasersForDay, type CalendarDay } from '../core/calendar'
import { fullDate, monthLabel } from '../core/dates'
import { navigate } from '../core/router'
import type { Teaser } from '../core/teaser'
import { TeaserRow } from './bits'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function CalendarScreen(props: {
  teasers: readonly Teaser[]
  month: string
  onMonthChange: (month: string) => void
  today: string
}) {
  const { teasers, month, today } = props
  const range = monthRange(teasers, today)
  const weeks = monthWeeks(teasers, month, today)
  // A day with more than one teaser shows them in a list below the calendar instead of opening one.
  const [chosen, setChosen] = useState<CalendarDay | null>(null)

  const changeMonth = (delta: number) => {
    setChosen(null)
    props.onMonthChange(addMonths(month, delta))
  }

  const openDay = (day: CalendarDay) => {
    const found = teasersForDay(day)
    if (found.length === 1) navigate({ name: 'teaser', slug: found[0].slug })
    else setChosen(chosen?.date === day.date ? null : day)
  }

  return (
    <main className="screen screen--calendar">
      <h1 className="screen__title">Calendar</h1>

      <div className="cal-nav">
        <button
          type="button"
          className="cal-nav__step tappable"
          aria-label="Previous month"
          disabled={month <= range.first}
          onClick={() => changeMonth(-1)}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <h2 className="cal-nav__month" aria-live="polite">
          {monthLabel(`${month}-01`)}
        </h2>
        <button
          type="button"
          className="cal-nav__step tappable"
          aria-label="Next month"
          disabled={month >= range.last}
          onClick={() => changeMonth(1)}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <table className="cal">
        <thead>
          <tr>
            {WEEKDAYS.map((short, index) => (
              <th key={short} scope="col" abbr={WEEKDAY_NAMES[index]}>
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, index) => (
            <tr key={index}>
              {week.map((day, column) => (
                <td key={day?.date ?? `pad-${column}`}>
                  {day && <Day day={day} chosen={chosen?.date === day.date} onOpen={() => openDay(day)} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="cal-legend" aria-label="Legend">
        <li>
          <span className="cal-legend__given" aria-hidden="true" />
          New teaser
        </li>
        <li>
          <span className="cal-legend__open" aria-hidden="true" />
          Open now
        </li>
        <li>
          <span className="cal-dot cal-dot--aramayis" aria-hidden="true" />
          Aramayis solved
        </li>
        <li>
          <span className="cal-dot cal-dot--armen" aria-hidden="true" />
          Armen solved
        </li>
        <li>
          <span className="cal-legend__band" aria-hidden="true" />
          Still solving
        </li>
      </ul>

      {chosen && (
        <section className="cal-choice" aria-live="polite">
          <h2 className="archive__month-label">{fullDate(chosen.date)}</h2>
          <ul className="archive__list">
            {teasersForDay(chosen).map((teaser) => (
              <li key={teaser.slug}>
                <TeaserRow teaser={teaser} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

function Day({ day, chosen, onOpen }: { day: CalendarDay; chosen: boolean; onOpen: () => void }) {
  const found = teasersForDay(day)
  const given = day.given.length > 0
  const open = day.given.some((teaser) => teaser.status === 'open')
  const solved = day.given.filter((teaser) => teaser.status === 'solved')
  const aramayis = solved.some((teaser) => teaser.solvedBy.includes('aramayis'))
  const armen = solved.some((teaser) => teaser.solvedBy.includes('armen'))
  const nobody = solved.length > 0 && !aramayis && !armen

  const classes = [
    'cal-day',
    given && 'cal-day--given',
    open && 'cal-day--open',
    found.length > 0 && 'cal-day--active',
    day.isToday && 'cal-day--today',
    chosen && 'cal-day--chosen',
  ]
    .filter(Boolean)
    .join(' ')

  const inside = (
    <>
      {day.span && (
        <span
          className={`cal-day__band${day.span.left ? ' cal-day__band--left' : ''}${day.span.right ? ' cal-day__band--right' : ''}`}
          aria-hidden="true"
        />
      )}
      <span className="cal-day__num">{day.day}</span>
      <span className="cal-day__marks" aria-hidden="true">
        {aramayis && <span className="cal-dot cal-dot--aramayis" />}
        {armen && <span className="cal-dot cal-dot--armen" />}
        {nobody && <span className="cal-dot cal-dot--nobody" />}
      </span>
    </>
  )

  if (found.length === 0) {
    return <span className={classes}>{inside}</span>
  }

  const label = `${fullDate(day.date)}${day.isToday ? ', today' : ''}: ${found.map((teaser) => teaser.title).join(', ')}`
  return (
    <button type="button" className={`${classes} tappable`} aria-label={label} onClick={onOpen}>
      {inside}
    </button>
  )
}
