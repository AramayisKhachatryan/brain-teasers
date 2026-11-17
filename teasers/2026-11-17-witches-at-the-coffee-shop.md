---
number: 18
date: 2026-11-17
title: "Witches at the coffee shop"
difficulty: 3
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-17
---

## Problem
Two witches make a nightly visit to an all-night coffee shop. Each arrives at a random time between 0:00 and 1:00. Each one of them stays for exactly 30 minutes. On any one given night, what is the probability that the witches will meet at the coffee shop?

## Solution
**The probability is $\tfrac34$.**

Measure time in hours and let the witches arrive at $x$ and $y$, independent and uniform on $[0, 1]$. Each stays half an hour, so they meet exactly when their arrivals are less than half an hour apart:
$$
|x - y| \le \tfrac12.
$$
In the unit square of possible $(x, y)$, the points where they *miss* each other are two corner triangles, each with legs $\tfrac12$ and area $\tfrac18$. So they miss with probability $\tfrac14$ and meet with probability
$$
1 - \tfrac14 = \tfrac34.
$$

## Notes
Both of us solved it the same day, without hints. Aramayis checked the answer, $\tfrac34$, with Claude.

Source: [BrainStellar #30](https://brainstellar.com/puzzles/easy/30)
