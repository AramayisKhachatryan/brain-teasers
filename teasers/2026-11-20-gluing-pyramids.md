---
number: 20
date: 2026-11-20
title: "Gluing Pyramids"
difficulty: 5
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-20
---

## Problem
A solid square-base pyramid, with all edges of unit length, and a solid trianglebase pyramid (tetrahedron), also with all edges of unit length, are glued together by matching two triangular faces.

How many faces does the resulting solid have?

## Solution
**5 faces.**

Counting naively, the square pyramid has 5 faces and the tetrahedron 4. Gluing hides one triangle of each, which leaves $5 + 4 - 2 = 7$. But two pairs of the remaining faces end up in the same plane, and each pair merges into a single face, so the answer is $7 - 2 = 5$.

**Why they're coplanar.** Stand two copies of the square pyramid side by side on a table, bases touching along an edge. Their apexes are 1 apart, the same as the edge length. The space between them is bounded by the shared base edge, the two apexes and the two nearby base corners, and every one of those six distances is 1. So the gap is exactly a unit tetrahedron. Fill it with one: its two outer faces lie flat against the slanted faces of the second pyramid. Hence, when the tetrahedron is glued to one pyramid, each of its two free side faces continues a side face of that pyramid in the same plane, forming a rhombus.

What's left: the square base, two original triangles, and two rhombi. That's 5 faces.

## Notes
Both of us solved it the same day, without hints. Aramayis first checked 7 with Claude (the naive count), then 5.

This puzzle made news in 1980: a question like it was on the PSAT, the official answer was 7, and a student who answered 5 got the question thrown out.

Source: Winkler, *Mathematical Puzzles*, puzzle #200
