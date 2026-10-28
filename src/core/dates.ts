// Teaser dates are calendar days (YYYY-MM-DD), so they are read as local dates, never as UTC.

function toLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** "Thursday 29 October" */
export function longDate(isoDate: string): string {
  return toLocalDate(isoDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** "Thursday 29 October 2026" */
export function fullDate(isoDate: string): string {
  return toLocalDate(isoDate).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** "29 Oct" */
export function shortDate(isoDate: string): string {
  return toLocalDate(isoDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** "October 2026", used to group the archive. */
export function monthLabel(isoDate: string): string {
  return toLocalDate(isoDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}
