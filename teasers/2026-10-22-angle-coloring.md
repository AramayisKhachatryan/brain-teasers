---
date: 2026-10-22
title: Angle-coloring game on an 8×8 board
status: solved
solved_by: [aramayis, armen]
---

## Problem
Two players take turns coloring cells of an 8×8 board. If, after a player's move, there is an "angle" on the board (three colored cells forming an L, like b2, c2, c3 on a chessboard, or the same shape rotated and placed anywhere), that player loses. Who has a winning strategy?

## Solution
**The second player wins.** We found two different strategies.

### Aramayis's solution: 2×2 boxes
Split the board into sixteen 2×2 boxes. Play second. Whenever the opponent colors a cell, color the cell in the same box that sits horizontally next to it.

- After each of your replies, every box is either empty or holds exactly one horizontal pair.
- Any third cell colored in a box creates an angle, so the opponent can never move into a box that already has a pair.
- Your reply can't create an angle that spans two boxes unless the opponent's move already created one, so you never lose first.

### Armen's solution: mirror symmetry
Play second and mirror every move across the vertical middle line of the board (between the d and e files).

- No cell maps to itself, so the mirrored cell is always free.
- If your mirrored reply ever completed an angle, the mirror image of that angle would already have been completed by the opponent's move, so they would have lost first.

## Notes
Both of us solved it without hints, each in a different way.
