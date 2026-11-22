---
number: 21
date: 2026-11-21
title: "Multilingual"
difficulty: 6
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-22
---

## Problem
A group has 70 members. For any two members $X$ and $Y$ there is a language that $X$ speaks but $Y$ does not, and there is a language that $Y$ speaks but $X$ does not. At least how many different languages are spoken by this group?

## Hints
1. After guesses of 12 and 11: the answer is smaller than 11. *(asked by Aramayis)*
2. After a guess of 7: the answer is between 7 and 11. *(asked by Aramayis)*

## Solution
**8 languages.**

Give each member the set of languages they speak. The condition says that for any two members, neither set contains the other: these 70 sets form an *antichain*.

**8 is enough.** Take 8 languages and give each member a different set of 4 of them. There are $\binom{8}{4} = 70$ such sets, and no 4-element set contains a different 4-element set.

**7 is not enough.** By Sperner's theorem, an antichain of subsets of an $n$-element set has at most $\binom{n}{\lfloor n/2 \rfloor}$ sets. For $n = 7$ that's $\binom{7}{3} = 35 < 70$, and fewer languages only allow fewer sets.

*Why Sperner holds (the LYM argument):* order the $n$ languages at random. The sets "first $k$ languages" for $k = 0, \dots, n$ form a chain, and a chain contains at most one set of an antichain. A given $k$-element set is such a prefix with probability $1/\binom{n}{k} \ge 1/\binom{n}{\lfloor n/2\rfloor}$. Adding these probabilities over the antichain gives at most 1, so the antichain has at most $\binom{n}{\lfloor n/2\rfloor}$ sets.

## Notes
Both of us solved it. Aramayis checked guesses with Claude: 12, 11 and 7 were wrong, then 8 was right, and saw why: $\binom{8}{4} = 70$ exactly.

Source: [BrainStellar #107](https://brainstellar.com/puzzles/medium/107)
