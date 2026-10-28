---
date: 2026-10-23
title: Twelve coins, three weighings
status: solved
solved_by: []
---

## Problem
Twelve coins look identical, but one is counterfeit and is either heavier or lighter. With a balance scale and three weighings, find the fake and say whether it is heavy or light.

## Hints
1. Each weighing has three outcomes, so three weighings give $3^3 = 27$. How many answers are possible? *(asked by Armen)*
2. Start with four against four. *(asked by Aramayis)*
3. After an unbalanced first weighing, move coins between the pans and bring in known-good ones. *(asked by Armen)*

## Solution
Weigh $\{1,2,3,4\}$ against $\{5,6,7,8\}$.

- **Balanced:** the fake is among 9 to 12. Weigh $\{9,10,11\}$ against three good coins. That tells you whether the fake is heavy or light and narrows it to three coins; one more weighing finds it.
- **Left heavy:** weigh $\{1,2,5\}$ against $\{3,6,9\}$, with 9 known good. Each of the three outcomes leaves at most three suspects with known directions, which the last weighing settles.

There are $24$ possible answers and $27$ outcomes, so there is just enough room.

## Notes
Neither of us finished the unbalanced branch before giving up.
