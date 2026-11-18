import type { CSSProperties } from 'react'
import type { Score } from '../core/score'

const solvedText = (n: number) => (n === 1 ? '1 solved' : `${n} solved`)

/** The running score (points, and teasers solved), with a two-ended pencil whose blue and red parts show each share. */
export function ScoreBoard({ score, solved }: { score: Score; solved: Score }) {
  const total = score.aramayis + score.armen
  const share = total === 0 ? 0.5 : score.aramayis / total
  return (
    <section className="score" aria-label={`Score: Aramayis ${score.aramayis} points, ${solvedText(solved.aramayis)}; Armen ${score.armen} points, ${solvedText(solved.armen)}`}>
      <div className="score__side score__side--aramayis" aria-hidden="true">
        <span className="score__name">Aramayis</span>
        <span className="score__points">{score.aramayis}</span>
        <span className="score__solved">{solvedText(solved.aramayis)}</span>
      </div>
      <div className="score__side score__side--armen" aria-hidden="true">
        <span className="score__name">Armen</span>
        <span className="score__points">{score.armen}</span>
        <span className="score__solved">{solvedText(solved.armen)}</span>
      </div>
      <div className="score__pencil" style={{ '--share': share } as CSSProperties} aria-hidden="true">
        <span className="score__lead score__lead--aramayis" />
        <span className="score__lead score__lead--armen" />
      </div>
    </section>
  )
}
