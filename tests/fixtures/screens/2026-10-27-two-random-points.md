---
number: 6
date: 2026-10-27
title: Two random points
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-10-28
---

## Problem
Pick two points independently and uniformly at random on a segment of length 1. What is the expected distance between them?

## Hints
1. Draw the two points as a single point $(x, y)$ in the unit square. *(asked by Armen)*
2. By symmetry you only need the half of the square where $x > y$. *(asked by Aramayis)*

## Solution
The distance is $|x - y|$. By symmetry, take $x > y$ and double:

$$
\mathbb{E}|X - Y| = 2 \int_0^1 \int_0^x (x - y)\, dy\, dx
$$
$$
= 2 \int_0^1 \frac{x^2}{2}\, dx = \frac13 .
$$

So the expected distance is **one third** of the segment.

## Notes
Armen guessed $\tfrac12$ first; the square picture fixed it.

Variant to try later: the expected distance between two random points in a unit square.
