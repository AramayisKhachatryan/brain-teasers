---
date: 2026-10-25
title: Ants on a metre stick
status: solved
solved_by: [armen]
---

## Problem
Twenty ants are dropped at random points on a metre stick, each facing left or right at random. They walk at 1 cm/s. When two ants meet, both turn around. An ant that reaches an end falls off.

How long until the stick is certainly empty?

## Hints
1. From far away, can you tell "bounce" apart from "walk through each other"? *(asked by Aramayis)*

## Solution
Treat a collision as the two ants passing through each other and swapping names. Nothing about the set of positions changes, so each "ghost" ant just walks straight to an end.

The worst case is an ant at one end walking the full length: **100 seconds**.

## Notes
Aramayis tried to simulate collisions by hand and got lost in the bookkeeping.
