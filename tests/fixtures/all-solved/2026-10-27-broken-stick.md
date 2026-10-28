---
date: 2026-10-27
title: The broken stick
status: solved
solved_by: [aramayis, armen]
---

## Problem
Break a stick of length 1 at two points chosen uniformly at random. What is the probability that the three pieces form a triangle?

## Hints
1. Write the triangle inequality for each piece. What does it say about the longest piece? *(asked by Armen)*
2. Draw the two break points as a point $(x, y)$ in the unit square. *(asked by Aramayis)*

## Solution
Three lengths form a triangle exactly when every piece is shorter than $\tfrac12$.

Let the break points be $x$ and $y$. With $x < y$ the pieces are $x$, $y - x$ and $1 - y$, and the conditions are

$$
x < \tfrac12, \qquad y - x < \tfrac12, \qquad y > \tfrac12 .
$$

That region is a triangle of area $\tfrac18$ inside the half-square $x < y$ of area $\tfrac12$, so

$$
P(\text{triangle}) = \frac{1/8}{1/2} = \frac14 .
$$

## Notes
Armen got there by symmetry first: the three "longest piece is too long" events are disjoint and each has probability $\tfrac14$.

Variant to try later: break the stick once, then break the longer piece again.
