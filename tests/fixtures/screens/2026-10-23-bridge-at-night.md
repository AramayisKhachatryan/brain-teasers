---
number: 4
date: 2026-10-23
title: Bridge at night
difficulty: 4
status: solved
solved_by: []
solved_on: 2026-10-25
---

## Problem
Four people must cross a narrow bridge at night. They have one torch, the bridge holds at most two people, and anyone crossing needs the torch. They take 1, 2, 5 and 10 minutes to cross; a pair walks at the slower one's speed. What is the shortest time for all four to cross?

## Hints
1. The torch has to come back after every crossing but the last. *(asked by Armen)*
2. Send the two slowest people across together. *(asked by Aramayis)*
3. Someone fast should already be waiting on the far side to bring the torch back. *(asked by Armen)*

## Solution
**17 minutes.** 1 and 2 cross (2), 1 returns (1), 5 and 10 cross (10), 2 returns (2), 1 and 2 cross (2): $2 + 1 + 10 + 2 + 2 = 17$.

## Notes
We both kept having the 1-minute person escort everyone, which takes 19 minutes.
