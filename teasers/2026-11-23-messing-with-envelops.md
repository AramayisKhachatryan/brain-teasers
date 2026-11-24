---
number: 22
date: 2026-11-23
title: "Messing with Envelops"
difficulty: 3
points: 1
days: 2
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-24
---

## Problem
There are $n$ letters and $n$ envelopes. You put the letters randomly in the envelopes so that each letter is in one envelope. (Effectively a random permutation of $n$ numbers chosen uniformly). Calculate the expected number of envelopes with the correct letter inside them.

## Hints
1. Don't count whole arrangements: look at one envelope at a time. How likely is it that this envelope holds its own letter? Then add those chances up. *(asked by Aramayis)*

## Solution
**The expected number is 1, for every $n$.**

Let $X_i = 1$ if envelope $i$ holds its own letter and $0$ otherwise. In a random arrangement, letter $i$ is equally likely to be in any of the $n$ envelopes, so $P(X_i = 1) = \tfrac1n$ and $E[X_i] = \tfrac1n$.

The number of correct envelopes is $X_1 + \dots + X_n$, and expectation adds up even though the $X_i$ depend on each other:
$$
E[X_1 + \dots + X_n] = n \cdot \frac1n = 1.
$$

## Notes
Both of us solved it, on the second of its two days, after one hint (asked by Aramayis). Aramayis's first guesses were $\sum_{k=1}^n \frac{1}{(k-1)!}$ and $\sum_{k=1}^n \frac1k$; then 1, which was right. We agreed on 1 point each because of the hint and the guesses.

The answer doesn't depend on $n$, and the $X_i$ aren't independent: linearity of expectation doesn't care. (The probability that *no* letter is in its own envelope is a different question, and tends to $1/e$.)

Source: [BrainStellar #205](https://brainstellar.com/puzzles/hard/205)
