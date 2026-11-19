---
number: 16
date: 2026-11-11
title: "Single-Cross"
difficulty: 6
points: 3
jane_street: "2020-02"
days: 10
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-16
---

## Problem
A random line segment of length D is chosen on a plane marked with an
infinite checkerboard grid (i.e., a unit side length square grid).
What length D maximizes the probability that the segment crosses
exactly one line on the checkerboard grid, and what is this maximal
probability?

## Hints
1. First fix the segment's angle. Then the vertical and the horizontal grid lines can be handled separately, and each is a 1-D problem: a stick of some length dropped at a random spot on a line with a mark at every integer. *(asked by Aramayis)*
2. In 1-D, a stick of length $L \le 1$ crosses a mark with probability exactly $L$. With the angle fixed, the horizontal and vertical positions are independent: add the chance of crossing a vertical line but no horizontal one and the reverse, then average over the angle. *(asked by Aramayis)*

## Solution
**The best length is $D = 1$, and the maximal probability is $\dfrac{2}{\pi} \approx 0.6366$.**

Fix the angle $\theta \in [0, \tfrac{\pi}{2}]$ of the segment with the horizontal (by symmetry that's enough). Its horizontal and vertical extents are
$$
a = D\cos\theta, \qquad b = D\sin\theta.
$$
The vertical lines only care about the horizontal position of the segment, and the horizontal lines only about the vertical position; these are independent and uniform. On a line with a mark at every integer, a stick of length $L \le 1$ crosses a mark with probability exactly $L$ (and never crosses two).

**For $D \le 1$:** exactly one crossing means a vertical line but no horizontal one, or the reverse:
$$
P(\text{one} \mid \theta) = a(1-b) + b(1-a) = a + b - 2ab.
$$
Averaging over $\theta$ uniform on $[0, \tfrac{\pi}{2}]$, with $\overline{\cos\theta} = \overline{\sin\theta} = \tfrac{2}{\pi}$ and $\overline{\sin\theta\cos\theta} = \tfrac{1}{\pi}$:
$$
P(D) = \frac{4D - 2D^2}{\pi} = \frac{2}{\pi}\,(2D - D^2),
$$
which increases all the way to $D = 1$, where it equals $\tfrac{2}{\pi}$.

**For $D > 1$** it only gets worse. At angles where one extent passes 1 (say $a > 1$), the segment always crosses at least one vertical line, and exactly one with probability $2 - a$. Exactly one crossing in total then has probability $(2-a)(1-b)$, which is smaller than $a + b - 2ab$ by $(a-1)(2-3b)$, a positive amount near $\theta = 0$. So $P(D)$ turns down right after $D = 1$: about $0.630$ at $D = 1.02$, $0.577$ at $1.1$ and $0.490$ at $1.2$.

So the unit length is best, with probability $2/\pi$.

## Notes
Both of us solved it, with two hints (both asked by Aramayis). Aramayis checked the length with Claude: $\tfrac12$ was wrong, $1$ right. This was our first Jane Street puzzle, given 10 days; we finished on day 6. Because we took two hints, it's worth 3 points each instead of 6.

Like Buffon's needle, $\pi$ comes in through averaging over the angle.

Source: [Jane Street, February 2020](https://www.janestreet.com/puzzles/single-cross-index/)
