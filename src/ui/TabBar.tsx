import { CalendarDays, Library, PencilLine, type LucideIcon } from 'lucide-react'
import type { MouseEvent } from 'react'
import { cameFrom, hrefFor, navigate, routeKey, type Route } from '../core/router'

type Section = 'home' | 'calendar' | 'archive'

const TABS: { to: Route; section: Section; label: string; Icon: LucideIcon }[] = [
  { to: { name: 'home' }, section: 'home', label: 'Current', Icon: PencilLine },
  { to: { name: 'calendar' }, section: 'calendar', label: 'Calendar', Icon: CalendarDays },
  { to: { name: 'archive' }, section: 'archive', label: 'Archive', Icon: Library },
]

/** The tab a screen belongs to. A teaser page belongs to the tab it was opened from (Archive after a direct link). */
export function sectionOf(route: Route, from: Route | null): Section {
  if (route.name !== 'teaser') return route.name
  if (from && from.name !== 'teaser') return from.name
  return 'archive'
}

export function TabBar({ route }: { route: Route }) {
  const onTap = (event: MouseEvent<HTMLAnchorElement>, to: Route) => {
    event.preventDefault()
    if (routeKey(to) === routeKey(route)) {
      // Like a native tab bar: tapping the open tab scrolls back to the top.
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
    } else {
      navigate(to)
    }
  }

  const active = sectionOf(route, cameFrom())
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar__inner">
        {TABS.map(({ to, section, label, Icon }) => (
          <a
            key={label}
            href={hrefFor(to)}
            className="tab tappable"
            aria-current={section === active ? 'page' : undefined}
            onClick={(event) => onTap(event, to)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  )
}
