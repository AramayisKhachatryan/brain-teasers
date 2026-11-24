---
number: 23
date: 2026-11-24
title: "Four steps"
difficulty: 2
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-24
---

## Problem
You start at $0$ on the number line. At every step you move one unit to the left or one unit to the right, each with probability $\tfrac12$, independently of the past.

What is the probability that after exactly 4 steps you are back at $0$?

## Solution
**The probability is $\tfrac38$.**

All $2^4 = 16$ step sequences are equally likely. To be back at $0$ you need two steps right and two left, and there are $\binom42 = 6$ ways to choose which two steps go right:
$$
P = \frac{6}{16} = \frac38.
$$

Another way: after 2 steps you're at $-2$, $0$ or $2$ with chances $\tfrac14, \tfrac12, \tfrac14$, and the last 2 steps must undo the first two:
$$
\tfrac14\cdot\tfrac14 + \tfrac12\cdot\tfrac12 + \tfrac14\cdot\tfrac14 = \tfrac38.
$$

## Notes
Both of us solved it on the day it was given, with no hints. Aramayis counted it directly: two $+1$s and two $-1$s in four places, $\binom42 / 2^4$.

In general, after $2n$ steps the chance of being at $0$ is $\binom{2n}{n}/4^n \approx 1/\sqrt{\pi n}$; after an odd number of steps it's $0$. Other ways to see it: a table of path counts (Pascal's triangle), or the constant term of $\tfrac1{16}(x + x^{-1})^4$. The first teaser of our random-walk series.

Source: written by Claude for our random-walk series
