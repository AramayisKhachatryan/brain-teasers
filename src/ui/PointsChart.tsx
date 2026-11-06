import { useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { daysBetween, shortDate } from '../core/dates'
import type { PointsDay } from '../core/stats'
import { DISPLAY_NAME, PEOPLE, numberedTitle, type Person } from '../core/teaser'

const HEIGHT = 210
const PAD = { top: 12, right: 92, bottom: 26, left: 30 }

/** 0, 10, 20 … : a step that gives 3–5 gridlines. */
function ticksUpTo(max: number): number[] {
  const step = [1, 2, 5, 10, 20, 25, 50, 100].find((s) => max / s <= 4) ?? 200
  const top = Math.max(step, Math.ceil(max / step) * step)
  return Array.from({ length: top / step + 1 }, (_, i) => i * step)
}

/**
 * Running points for both, as two step lines over the days teasers were finished. Tap or hover to see a day;
 * the names and totals sit at the line ends, and a hidden table carries the same numbers for screen readers.
 */
export function PointsChart({ timeline }: { timeline: readonly PointsDay[] }) {
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(340)
  const [active, setActive] = useState<number | null>(null)

  useLayoutEffect(() => {
    const element = box.current
    if (!element) return
    const measure = () => setWidth(Math.max(260, element.clientWidth))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const start = timeline[0].date
  const span = Math.max(1, daysBetween(start, timeline[timeline.length - 1].date))
  const plotW = width - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const max = Math.max(1, ...timeline.flatMap((day) => PEOPLE.map((person) => day.points[person])))
  const ticks = ticksUpTo(max)
  const top = ticks[ticks.length - 1]
  const x = (date: string) => PAD.left + (daysBetween(start, date) / span) * plotW
  const y = (points: number) => PAD.top + plotH - (points / top) * plotH

  // Step-after paths starting from 0 on the first day.
  const path = (person: Person) => {
    let d = `M${x(start)},${y(0)}`
    for (const day of timeline) d += ` H${x(day.date)} V${y(day.points[person])}`
    return d
  }

  // Direct labels at the right end, nudged apart when the totals are close.
  const end = timeline[timeline.length - 1]
  const labelY = Object.fromEntries(PEOPLE.map((person) => [person, y(end.points[person])])) as Record<Person, number>
  const [hi, lo] = [...PEOPLE].sort((a, b) => labelY[a] - labelY[b])
  if (labelY[lo] - labelY[hi] < 30) {
    const mid = (labelY[lo] + labelY[hi]) / 2
    labelY[hi] = mid - 15
    labelY[lo] = mid + 15
  }

  const pick = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const px = ((event.clientX - rect.left) / rect.width) * width
    let best = 0
    timeline.forEach((day, i) => {
      if (Math.abs(x(day.date) - px) < Math.abs(x(timeline[best].date) - px)) best = i
    })
    setActive(best)
  }

  const shown = active === null ? null : timeline[active]
  const tipLeft = shown ? Math.min(Math.max(x(shown.date) - 90, 0), width - 180) : 0

  return (
    <div className="chart" ref={box}>
      <div className="chart__legend" aria-hidden="true">
        {PEOPLE.map((person) => (
          <span key={person} className="chart__key">
            <span className={`chart__swatch chart__swatch--${person}`} />
            {DISPLAY_NAME[person]}
          </span>
        ))}
      </div>
      <div className="chart__plot">
        <svg
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={`Points over time. Now ${PEOPLE.map((p) => `${DISPLAY_NAME[p]} ${end.points[p]}`).join(', ')}.`}
          onPointerDown={pick}
          onPointerMove={pick}
          onPointerLeave={(event) => event.pointerType === 'mouse' && setActive(null)}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line className="chart__grid" x1={PAD.left} x2={PAD.left + plotW} y1={y(tick)} y2={y(tick)} />
              <text className="chart__axis" x={PAD.left - 8} y={y(tick)} dy="0.32em" textAnchor="end">
                {tick}
              </text>
            </g>
          ))}
          <text className="chart__axis" x={x(start)} y={HEIGHT - 6} textAnchor="start">
            {shortDate(start)}
          </text>
          <text className="chart__axis" x={x(end.date)} y={HEIGHT - 6} textAnchor="end">
            {shortDate(end.date)}
          </text>

          {shown && <line className="chart__cross" x1={x(shown.date)} x2={x(shown.date)} y1={PAD.top} y2={PAD.top + plotH} />}

          {PEOPLE.map((person) => (
            <path key={person} className={`chart__line chart__line--${person}`} d={path(person)} />
          ))}
          {PEOPLE.map((person) => (
            <g key={person}>
              <circle className={`chart__dot chart__dot--${person}`} cx={x(end.date)} cy={y(end.points[person])} r={4} />
              <text className="chart__end" x={PAD.left + plotW + 10} y={labelY[person]} dy="0.32em">
                <tspan className="chart__end-name">{DISPLAY_NAME[person]}</tspan>
                <tspan className="chart__end-value" x={PAD.left + plotW + 10} dy="1.15em">
                  {end.points[person]}
                </tspan>
              </text>
            </g>
          ))}
          {shown &&
            PEOPLE.map((person) => (
              <circle
                key={person}
                className={`chart__dot chart__dot--${person}`}
                cx={x(shown.date)}
                cy={y(shown.points[person])}
                r={4}
              />
            ))}
        </svg>
        {shown && (
          <div className="chart__tip" style={{ left: tipLeft }} role="status">
            <p className="chart__tip-date">{shortDate(shown.date)}</p>
            <p className="chart__tip-points">
              {PEOPLE.map((person) => (
                <span key={person}>
                  <span className={`chart__swatch chart__swatch--${person}`} />
                  {DISPLAY_NAME[person]} {shown.points[person]}
                </span>
              ))}
            </p>
            {shown.finished.map((teaser) => (
              <p key={teaser.slug} className="chart__tip-teaser">
                {numberedTitle(teaser)}
                {teaser.solvedBy.length ? ` +${teaser.difficulty}` : ' (nobody)'}
              </p>
            ))}
          </div>
        )}
      </div>
      <table className="visually-hidden">
        <caption>Points after each day a teaser was finished</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            {PEOPLE.map((person) => (
              <th key={person} scope="col">
                {DISPLAY_NAME[person]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeline.map((day) => (
            <tr key={day.date}>
              <th scope="row">{shortDate(day.date)}</th>
              {PEOPLE.map((person) => (
                <td key={person}>{day.points[person]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
