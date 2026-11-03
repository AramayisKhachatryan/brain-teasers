---
number: 8
date: 2026-10-31
title: Candies in a circle
status: solved
solved_by: []
solved_on: 2026-11-01
---

## Problem
A group of students are sitting in a circle with the teacher in the center. They all have an even number of candies (not necessarily equal).

When the teacher blows a whistle, each student passes half of their candies to the student on their left. Then each student who has an odd number of candies gets one extra candy from the teacher.

Show that after a finite number of whistles, all students have the same number of candies.

## Solution
Track the largest and the smallest number of candies. The largest can never grow, and the smallest must keep growing until everyone is equal.

Every student keeps half of their own candies and receives half of their right-hand neighbour's. So a student with $a$ candies whose right-hand neighbour has $b$ ends up with
$$
\tfrac{a}{2} + \tfrac{b}{2},
$$
plus 1 if that's odd. After every whistle all amounts are even again. Let $M$ be the largest amount and $m$ the smallest (both even).

**The largest never grows.** The new amount is at most $\tfrac{M}{2} + \tfrac{M}{2} = M$. If it equals $M$, it's even, so no extra candy. If it's less than $M$, then even with the extra candy it's at most $M$, because $M$ is even.

**The smallest never shrinks.** The new amount is at least $\tfrac{m}{2} + \tfrac{m}{2} = m$.

**Fewer students stay at the smallest.** A student ends at exactly $m$ only if they and their right-hand neighbour both had $m$. If either had more (at least $m + 2$), the new amount is at least $m + 1$, and being even, at least $m + 2$. So no student newly drops to $m$. And unless everyone has $m$, somewhere around the circle a student with $m$ sits just left of a student with more, and that student leaves $m$.

So while the students aren't all equal, each whistle strictly reduces the number of students holding the minimum $m$. After at most $n$ whistles (for $n$ students) nobody has $m$ any more, and the minimum has risen by at least 2. The maximum never rises, so the minimum can only rise $(M - m)/2$ times. Then the minimum equals the maximum: **everyone has the same number of candies**, after a finite number of whistles.

## Notes
Neither of us solved it, and no hints were asked for.

The key idea is a *monovariant*: a quantity that can only move one way. Here the maximum never goes up, while the minimum is forced up step by step.
