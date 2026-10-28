---
date: 2026-10-21
title: Rolling to a hundred
status: solved
solved_by: [aramayis]
---

## Problem
You keep rolling a fair die and adding up the results until the total is at least 100. Which final total is most likely?

## Solution
The final total lies between 100 and 105. To finish on $100 + k$ you must stand at some total $t \le 99$ and roll exactly $100 + k - t$, which is only possible from $t \ge 94 + k$. Higher finishes have fewer starting points, so **100** is most likely, with probability about $\tfrac{6}{21} \approx 0.29$.
