---
date: 2026-10-27
title: King's salary
status: solved
solved_by: [aramayis]
solved_on: 2026-10-27
---

## Problem
After the revolution, each of the 66 citizens of a certain city, including the king, has a salary of 1. The king cannot vote, but has the power to suggest changes, namely redistribution of salaries. Each person's salary must be a whole number of dollars, and the salaries must sum to 66. He suggests a new salary plan for every person including himself in front of the city. Citizens are greedy, and vote yes if their salary is raised, no if decreased, and don't vote otherwise. The suggested plan will be implemented if the number of "yes" votes is more than "no" votes. The king is both selfish and clever. He proposes a series of such plans. What is the maximum salary he can obtain for himself?

## Solution
**63.** The final plan: the king gets 63, one citizen gets 2, another gets 1, everyone else 0.

The king doesn't vote, so a plan passes when more of the 65 citizens get a raise than get a cut. Anyone who gets a raise ends up with at least 1.

### Upper bound: no more than 63
**Lemma 1.** The king can never reach a state where at most one citizen has a nonzero salary.

Suppose some plan first produces such a state. Every raised citizen ends with a nonzero salary, so at most 1 citizen was raised. Then "yes > no" forces 0 cuts, so no citizen's salary went down. So every citizen who was nonzero before is still nonzero after, and the state before also had at most one nonzero citizen. That contradicts "first". The start state, with 65 nonzero citizens, isn't such a state.

**Lemma 2.** The king can never reach a state where the citizens' salaries add up to 2 or less.

Suppose some plan first produces such a state. Before it, the citizens held at least 3 in total. Raised citizens end with at least 1 each, so at most 2 were raised.

- **1 raised:** then 0 cuts, so the citizens' total can't have gone down. Contradiction.
- **2 raised:** then each ends with exactly 1 (so they had 0 before), every other citizen ends with 0, and there was at most 1 cut. Unchanged citizens had 0 before too, so before the plan only the one who was cut could be nonzero. By Lemma 1 that state is unreachable.

So the citizens always hold at least 3 in total, and the king gets at most 66 − 3 = 63.

### Construction: the king does reach 63
Repeatedly keep a bare majority of the citizens who hold money. Cut everyone else to 0, give each kept holder +1, and the king takes the rest. When only 2 holders are left, also raise one person from 0 to 1 so the "yes" votes still win.

| Step | Plan (yes vs no) | King | Citizens |
|---|---|---|---|
| start | | 1 | 65 × 1 |
| 1 | 33 up to 2, 32 cut (33 vs 32); the king pays 1 | 0 | 33 × 2 |
| 2 | 17 up to 3, 16 cut (17 vs 16) | 15 | 17 × 3 |
| 3 | 9 up to 4, 8 cut (9 vs 8) | 30 | 9 × 4 |
| 4 | 5 up to 5, 4 cut (5 vs 4) | 41 | 5 × 5 |
| 5 | 3 up to 6, 2 cut (3 vs 2) | 48 | 3 × 6 |
| 6 | 2 up to 7, 1 cut (2 vs 1) | 52 | 2 × 7 |
| 7 | A 7→8, C 0→1, B 7→0 (2 vs 1) | 57 | 8, 1 |
| 8 | C 1→2, D 0→1, A 8→0 (2 vs 1) | 63 | 2, 1 |

Every step passes, and the salaries always add up to 66 (checked by simulating each step).

## Notes
Aramayis solved it the same day, without hints, and found the same 63 / 2 / 1 split. Armen didn't get it.
