import { useLayoutEffect, useState, useSyncExternalStore } from 'react'
import { DEFAULT_VIEW, type ArchiveView } from './core/archive'
import { monthOf, todayIso } from './core/calendar'
import { currentRoute, lastNavigation, onBeforeChange, routeKey, subscribe } from './core/router'
import { computeScore } from './core/score'
import { archiveTeasers, currentTeaser, lastSolved } from './core/select'
import { teasers } from './teasers'
import { ArchiveScreen } from './ui/ArchiveScreen'
import { CalendarScreen } from './ui/CalendarScreen'
import { HomeScreen, TeaserScreen } from './ui/screens'
import { TabBar } from './ui/TabBar'

const score = computeScore(teasers)
const current = currentTeaser(teasers)
const archive = archiveTeasers(teasers)
const last = lastSolved(teasers)

// Back/forward returns to where you were; a tap on something new starts at the top.
const scrollPositions = new Map<string, number>()
onBeforeChange((previous) => scrollPositions.set(routeKey(previous), window.scrollY))

export function App() {
  const route = useSyncExternalStore(subscribe, currentRoute)
  const key = routeKey(route)
  // Lives here, above the screens, so a search or filter is still there after opening a teaser and coming back.
  const [archiveView, setArchiveView] = useState<ArchiveView>(DEFAULT_VIEW)
  const today = todayIso()
  const [calendarMonth, setCalendarMonth] = useState(() => monthOf(today))

  useLayoutEffect(() => {
    window.scrollTo(0, lastNavigation() === 'pop' ? (scrollPositions.get(key) ?? 0) : 0)
  }, [key])

  let screen
  switch (route.name) {
    case 'home':
      screen = <HomeScreen current={current} lastSolved={last} score={score} />
      break
    case 'calendar':
      screen = <CalendarScreen teasers={teasers} month={calendarMonth} onMonthChange={setCalendarMonth} today={today} />
      break
    case 'archive':
      screen = <ArchiveScreen teasers={archive} view={archiveView} onViewChange={setArchiveView} />
      break
    case 'teaser':
      screen = <TeaserScreen teaser={teasers.find((teaser) => teaser.slug === route.slug)} />
      break
  }

  return (
    <>
      <div key={key}>{screen}</div>
      <TabBar route={route} />
    </>
  )
}
