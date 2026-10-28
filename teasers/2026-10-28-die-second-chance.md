---
date: 2026-10-28
title: Die roll with a second chance
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-10-28
---

## Problem
Roll a die, and you get paid what the die shows. But if you want, you can request a second chance and roll the die again; you get paid what the second roll shows instead of the first. What is the expected value?

## Solution
**4.25** ($\tfrac{17}{4}$). Reroll if the first roll is 1, 2 or 3; keep 4, 5 or 6.

A reroll is worth 3.5 on average, so keep the first roll only when it beats 3.5.

$$
E = \tfrac16 (4 + 5 + 6) + \tfrac12 \cdot 3.5 = 2.5 + 1.75 = 4.25
$$

Aramayis's way of seeing it: rerolling on 1, 2, 3 replaces their contribution $\tfrac16 (1 + 2 + 3) = 1$ with $\tfrac16 \cdot 3 \cdot 3.5 = 1.75$, which raises the expected value.

## Notes
Both of us solved it the same day, without hints.
