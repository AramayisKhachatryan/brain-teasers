import type { CSSProperties } from 'react'
import type { Score } from '../core/score'

/** The running score, with a two-ended pencil whose blue and red parts show each share. */
export function ScoreBoard({ score }: { score: Score }) {
  const total = score.aramayis + score.armen
  const share = total === 0 ? 0.5 : score.aramayis / total
  return (
    <section className="score" aria-label={`Score: Aramayis ${score.aramayis}, Armen ${score.armen}`}>
      <div className="score__side score__side--aramayis" aria-hidden="true">
        <span className="score__name">Aramayis</span>
        <span className="score__points">{score.aramayis}</span>
      </div>
      <div className="score__side score__side--armen" aria-hidden="true">
        <span className="score__name">Armen</span>
        <span className="score__points">{score.armen}</span>
      </div>
      <div className="score__pencil" style={{ '--share': share } as CSSProperties} aria-hidden="true">
        <span className="score__lead score__lead--aramayis" />
        <span className="score__lead score__lead--armen" />
      </div>
    </section>
  )
}
