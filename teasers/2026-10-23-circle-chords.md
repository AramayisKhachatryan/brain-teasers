---
date: 2026-10-23
title: Chords on a circle
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-10-24
---

## Problem
There are 8 points on a circle. Two players take turns. On each turn, the player picks 2 of the points and draws the chord connecting them. If the chord a player draws crosses any chord already drawn, that player loses. Which player has a winning strategy?

### Rules we agreed on
- Chords that only meet at one of the 8 points don't count as crossing. Only crossing strictly inside the circle loses.
- A point can be the endpoint of any number of chords.
- A chord that is already drawn can't be drawn again.
- Neighbouring points can be joined too (that chord is a side of the octagon).
- If a player has no chord left that avoids a crossing, they must draw a crossing one, so they lose.
- Where the points sit on the circle doesn't matter: whether two chords cross depends only on the order of their endpoints.

## Solution
**The first player wins.** Both of us found the symmetry strategy.

Number the points 1 to 8 around the circle. On the first move, draw the chord 1–5. It splits the other points 3 and 3: {2, 3, 4} on one side and {6, 7, 8} on the other. Reflecting across this chord swaps 2↔8, 3↔7, 4↔6 and fixes 1 and 5.

From then on, whenever the opponent draws a chord, draw its mirror image across 1–5. The mirror move is always safe, as long as the opponent hasn't already lost:

- After each of your replies the picture is symmetric across 1–5.
- The only chords that are their own mirror image are 1–5 (already drawn) and 2–8, 3–7, 4–6, which all cross 1–5. So a legal chord from the opponent lies on one side of 1–5 and its mirror on the other: a different chord that doesn't cross it.
- The mirror chord isn't already on the board, because then the opponent's chord would be too.
- If the mirror chord crossed some chord C, the opponent's chord would cross the mirror of C, which is also on the board. So the opponent would have lost first.

So the first player can always answer, and the second player eventually has to cross.

### Counting check
The game ends the same way however both players move. A set of non-crossing chords on 8 points that can't be extended is a triangulation of the octagon: its 8 sides plus 5 diagonals, always $2 \cdot 8 - 3 = 13$ chords. 13 is odd, so the first player draws the 13th safe chord and the second player is forced to cross. **Any play at all wins for the first player.** The symmetry strategy is just one way to see it.

## Notes
Solved by both of us without hints, the day after it was posted.

The original wording, in Armenian:

> Ունենք շրջանագծի վրա 8 կետ, ու ամեն քայլին մեզնից մեկը որոշում է 2 կետ և նրանցով լար տանում։ Ում հերթին նրա տարած լարը հատի արդեն եղած լարերից մեկը, պարտվում է։ Ով ունի հաղթելու ստրատեգիա։
