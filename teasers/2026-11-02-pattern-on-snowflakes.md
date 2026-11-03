---
number: 10
date: 2026-11-02
title: "Pattern on snowflakes"
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-02
---

## Problem
Snow-particles are falling on the ground one after another. A particular snowflake turns out to be of type "Stellar Dendrite" with probability 'p' if its previous particle was also Stellar Dendrite, and with probability 'q' if previous one was something else. If a snowflake is picked from ground, what is the probability that it is Stellar Dendrite?

## Solution
**The probability is $\dfrac{q}{1-p+q}$.**

Let $\pi$ be the fraction of Stellar Dendrites on the ground once many flakes have fallen. A flake is a dendrite in one of two ways: the flake before it was a dendrite (a fraction $\pi$ of them) and this one followed suit, with probability $p$; or the flake before it was something else (a fraction $1-\pi$) and this one is a dendrite anyway, with probability $q$. In the long run the fraction stays the same, so
$$
\pi = p\,\pi + q\,(1-\pi).
$$
That gives $\pi\,(1-p+q) = q$, so
$$
\pi = \frac{q}{1-p+q}.
$$

Another way to see it: in the long run, switches from dendrite to something else, $\pi(1-p)$, balance switches back, $(1-\pi)\,q$.

The first flake doesn't matter. If $\pi_n$ is the probability that the $n$-th flake is a dendrite, then $\pi_{n+1} = q + (p-q)\,\pi_n$, so
$$
\pi_n - \pi = (p-q)^{n-1}(\pi_1 - \pi),
$$
which shrinks to 0, because $|p-q| < 1$. (The one exception is $p = 1$, $q = 0$: then every flake is the same type as the first, and the answer depends on it.)

## Notes
Both of us solved it the same day, without hints. Aramayis checked the answer, $q/(1-p+q)$, with Claude.

The snowfall is a two-state Markov chain, and the answer is its stationary distribution.

Source: [BrainStellar #109](https://brainstellar.com/puzzles/medium/109)
