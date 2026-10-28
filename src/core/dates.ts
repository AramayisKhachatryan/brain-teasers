// Teaser dates are calendar days (YYYY-MM-DD), so they are read as local dates, never as UTC.

function toLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// Built from parts, because Intl puts a comma after the weekday only when a year is included.
function format(isoDate: string, options: Intl.DateTimeFormatOptions): string {
  return toLocalDate(isoDate).toLocaleDateString('en-GB', options)
}

/** "Thursday 29 October" */
export function longDate(isoDate: string): string {
  return `${format(isoDate, { weekday: 'long' })} ${format(isoDate, { day: 'numeric', month: 'long' })}`
}

/** "Thursday 29 October 2026" */
export function fullDate(isoDate: string): string {
  return `${longDate(isoDate)} ${format(isoDate, { year: 'numeric' })}`
}

/** "29 Oct" */
export function shortDate(isoDate: string): string {
  return format(isoDate, { day: 'numeric', month: 'short' })
}

/** "October 2026", used to group the archive. */
export function monthLabel(isoDate: string): string {
  return format(isoDate, { month: 'long', year: 'numeric' })
}
