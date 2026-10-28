---
date: 2026-09-29
title: Shared birthdays
status: solved
solved_by: [aramayis]
---

## Problem
How many people do you need in a room for the chance that two share a birthday to pass one half?

## Solution
The chance that $n$ people all have different birthdays is $\prod_{k=0}^{n-1} \frac{365-k}{365}$, which first drops below $\tfrac12$ at $n = 23$.
