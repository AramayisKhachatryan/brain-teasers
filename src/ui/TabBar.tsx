import { Library, PencilLine, type LucideIcon } from 'lucide-react'
import type { MouseEvent } from 'react'
import { hrefFor, navigate, routeKey, type Route } from '../core/router'

const TABS: { to: Route; label: string; Icon: LucideIcon; isActive: (route: Route) => boolean }[] = [
  { to: { name: 'home' }, label: 'Current', Icon: PencilLine, isActive: (route) => route.name === 'home' },
  { to: { name: 'archive' }, label: 'Archive', Icon: Library, isActive: (route) => route.name !== 'home' },
]

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

  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabbar__inner">
        {TABS.map(({ to, label, Icon, isActive }) => (
          <a
            key={label}
            href={hrefFor(to)}
            className="tab tappable"
            aria-current={isActive(route) ? 'page' : undefined}
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
