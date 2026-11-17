---
number: 17
date: 2026-11-17
title: "Broken ATM"
difficulty: 4
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-17
---

## Problem
George owns only $500, all in a bank account. He needs cash badly but his only option is a broken ATM that can process only withdrawals of exactly $300, and deposits of exactly $198. How much cash can George get out of his account?

## Solution
**George can get \$498.**

**No more than that.** Every transaction changes the balance by $-300$ or $+198$, and both are multiples of 6. So the balance always leaves the same remainder as \$500 when divided by 6, which is 2. The balance can never go below \$2, so at most $500 - 2 = 498$ dollars come out.

**And \$498 is reachable.** Use a simple rule: withdraw \$300 whenever the balance is at least \$300, otherwise deposit \$198 of the cash in hand. Cash in hand never goes negative, and following this rule the balance reaches \$2 after 34 withdrawals and 49 deposits:
$$
34 \cdot 300 - 49 \cdot 198 = 10200 - 9702 = 498.
$$

## Notes
Both of us solved it the same day, without hints. Aramayis checked the answer, \$498, with Claude.

The key is the invariant: $\gcd(300, 198) = 6$ decides everything. With other machine amounts $a$ and $b$, the most you can extract is the balance minus its remainder mod $\gcd(a, b)$.

Source: Winkler, *Mathematical Puzzles*, puzzle #42
