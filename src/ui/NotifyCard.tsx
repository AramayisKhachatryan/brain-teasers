import { BellRing } from 'lucide-react'
import { useState } from 'react'
import { closeCard, initialCardState, turnOnNotifications, type CardState } from '../push'

/** On Home until notifications are set up on this phone; "Not now" hides it for a few days. */
export function NotifyCard() {
  const [state, setState] = useState<CardState>(initialCardState)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState<'yes' | 'failed' | null>(null)

  if (state.kind === 'hidden') return null

  const hide = (reason: 'done' | 'later') => {
    closeCard(reason)
    setState({ kind: 'hidden' })
  }

  const turnOn = async () => {
    setBusy(true)
    try {
      setState(await turnOnNotifications())
    } catch (error) {
      setState({ kind: 'offer', error: error instanceof Error ? error.message : String(error) })
    } finally {
      setBusy(false)
    }
  }

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied('yes')
    } catch {
      setCopied('failed')
    }
  }

  let title: string
  let text: string
  let actions
  if (state.kind === 'offer') {
    title = 'Notifications for new teasers'
    text = state.error
      ? `Couldn't turn them on: ${state.error}.`
      : 'Get a notification on this phone when a new teaser arrives.'
    actions = (
      <>
        <button type="button" className="button button--primary tappable" disabled={busy} onClick={turnOn}>
          {busy ? 'Turning on…' : state.error ? 'Try again' : 'Turn on notifications'}
        </button>
        <button type="button" className="button button--quiet tappable" onClick={() => hide('later')}>
          Not now
        </button>
      </>
    )
  } else if (state.kind === 'blocked') {
    title = 'Notifications are blocked'
    text = 'To allow them, open the Settings app, then Notifications, then Teasers, and turn on Allow Notifications.'
    actions = (
      <button type="button" className="button button--quiet tappable" onClick={() => hide('later')}>
        Hide
      </button>
    )
  } else {
    title = 'One more step'
    text =
      "Notifications are on. Copy this phone's code and send it to Claude in your chat, so new teasers reach this phone. Armen: send it to Aramayis."
    actions = (
      <>
        <button type="button" className="button button--primary tappable" onClick={() => copy(state.code)}>
          {copied === 'yes' ? 'Copied' : 'Copy code'}
        </button>
        <button type="button" className="button button--quiet tappable" onClick={() => hide('done')}>
          Done
        </button>
      </>
    )
  }

  return (
    <section className="notify-card" aria-labelledby="notify-card-title">
      <h2 className="notify-card__title" id="notify-card-title">
        <BellRing aria-hidden="true" />
        {title}
      </h2>
      <p className="notify-card__text">{text}</p>
      {state.kind === 'code' && copied === 'failed' && (
        <textarea className="notify-card__code" readOnly value={state.code} aria-label="This phone's code" rows={4} />
      )}
      <div className="notify-card__actions">{actions}</div>
    </section>
  )
}
