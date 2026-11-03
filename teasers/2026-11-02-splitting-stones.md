---
number: 9
date: 2026-11-02
title: Splitting stones
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-02
---

## Problem
There are three piles with 10, 15 and 20 stones.

On each turn, a player picks a pile with more than one stone and splits it into two non-empty piles in any way. The player who cannot move loses.

Alice moves first. Who has a winning strategy?

## Solution
**The second player wins, whatever anyone does.** There is no strategy to find: the length of the game is fixed.

Every move splits one pile into two, so the number of piles goes up by exactly 1. The game ends when no pile has more than one stone, that is, when there are $10 + 15 + 20 = 45$ piles of one stone. Starting from 3 piles, that takes exactly
$$
45 - 3 = 42
$$
moves, however the piles are split.

42 is even, so the second player makes the last move, and Alice is the one left without a move.

## Notes
Both of us solved it the same day, without hints.

The same counting works for any splitting game: breaking a chocolate bar into its squares always takes one break fewer than the number of squares.
