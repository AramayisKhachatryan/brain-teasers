---
date: 2026-10-29
title: Twelve balls, three weighings
status: solved
solved_by: [aramayis]
solved_on: 2026-10-30
---

## Problem
You have 12 visually identical balls, exactly one of which has a different weight. You do not know whether the defective ball is heavier or lighter.

Using a balance scale, can you identify the defective ball and determine whether it is heavier or lighter in at most three weighings?

## Solution
**Yes.** Number the balls 1 to 12.

### Why it has to start with 4 against 4
There are $12 \times 2 = 24$ possible answers (which ball, heavier or lighter), and three weighings have $3^3 = 27$ outcomes, so there is just enough room. After the first weighing, at most 9 answers may remain for the last two weighings:

- 3 against 3: if it balances, 6 balls are left, so 12 answers. Too many.
- 5 against 5: if it tips, 10 answers are left. Too many.
- 4 against 4: 8 answers left either way.

### First weighing: 1 2 3 4 against 5 6 7 8
**If it balances**, the odd ball is among 9 to 12, and 1 to 8 are genuine. Weigh 9 10 11 against 1 2 3:

- Balances: ball 12 is odd. Weigh it against ball 1 to see if it is heavier or lighter.
- 9 10 11 heavier: one of them is heavy. Weigh 9 against 10: the heavier one is odd; if they balance, it's 11.
- 9 10 11 lighter: the same, looking for the lighter one.

**If the left pan is heavier**, the odd ball is one of 1 2 3 4 and heavy, or one of 5 6 7 8 and light. Ball 9 is genuine. Weigh 1 2 5 against 3 6 9:

- Left heavier: 1 or 2 is heavy, or 6 is light. Weigh 1 against 2: the heavier one is odd and heavy; if they balance, 6 is light.
- Right heavier: 3 is heavy or 5 is light. Weigh 3 against 9: if 3 is heavier, it's heavy; if they balance, 5 is light.
- Balances: 4 is heavy, or 7 or 8 is light. Weigh 7 against 8: the lighter one is odd and light; if they balance, 4 is heavy.

**If the right pan is heavier**, do the same with heavy and light swapped.

Every case ends after three weighings with the ball and whether it is heavier or lighter.

## Notes
Aramayis solved it a day after it was posted, without hints. Armen didn't get it.

Variants to try later: with 13 balls you can still find the odd ball in three weighings, but not always tell whether it's heavier or lighter. Given one extra ball known to be genuine, 13 balls work completely. In general, $n$ weighings handle $(3^n - 3)/2$ balls.
