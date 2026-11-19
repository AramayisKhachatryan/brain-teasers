---
number: 19
date: 2026-11-18
title: Heads versus tails
difficulty: 6
status: solved
solved_by: [armen]
solved_on: 2026-11-19
---

## Problem
A fair coin is tossed 2024 times. Find the expected value of the random variable $|H - T|$, where $H$ is the number of heads and $T$ is the number of tails.

## Hints
1. Since $H + T = 2024$, you have $|H - T| = 2\,|H - 1012|$. So you need $E|H - 1012|$ for a binomial variable: write it as a sum over $k$ and look for a way to make it telescope. *(asked by Aramayis)*
2. With $m = 1012$, by symmetry $E|H - m| = 2\sum_{k=m+1}^{2m} (k - m)\binom{2m}{k} / 2^{2m}$, and $(k - m)\binom{2m}{k} = m\left[\binom{2m-1}{k-1} - \binom{2m-1}{k}\right]$. *(asked by Aramayis)*

## Solution
**The expected value is $\dfrac{2024\binom{2024}{1012}}{2^{2024}} \approx 35.89$.**

Let $n = 2m$ tosses, $m = 1012$. Since $H + T = n$, $|H - T| = |2H - n| = 2\,|H - m|$, with $H$ binomial: $P(H = k) = \binom{2m}{k} / 2^{2m}$.

By symmetry ($k \leftrightarrow 2m - k$), the terms above $m$ and below $m$ contribute equally:
$$
E|H - m| = \frac{2}{2^{2m}} \sum_{k=m+1}^{2m} (k - m)\binom{2m}{k}.
$$
Writing each binomial with factorials, $\binom{2m-1}{k-1} = \frac{k}{2m}\binom{2m}{k}$ and $\binom{2m-1}{k} = \frac{2m-k}{2m}\binom{2m}{k}$, so their difference is $\frac{k-m}{m}\binom{2m}{k}$:
$$
(k - m)\binom{2m}{k} = m\left[\binom{2m-1}{k-1} - \binom{2m-1}{k}\right].
$$
The sum telescopes from $k = m+1$ to $2m$, leaving $m\binom{2m-1}{m}$ (the last term, $\binom{2m-1}{2m}$, is 0). With $\binom{2m-1}{m} = \tfrac12\binom{2m}{m}$:
$$
E|H - m| = \frac{2m \cdot \frac12\binom{2m}{m}}{2^{2m}} = \frac{m\binom{2m}{m}}{2^{2m}},
$$
and
$$
E|H - T| = 2\,E|H - m| = \frac{2m\binom{2m}{m}}{2^{2m}} = \frac{2024\binom{2024}{1012}}{2^{2024}}.
$$
Numerically that's about $35.89$. Since $\binom{2m}{m}/4^m \approx 1/\sqrt{\pi m}$, the answer is close to $\sqrt{2n/\pi} \approx 35.9$.

Small cases check out: 2 tosses give 1, 4 give $\tfrac32$, 6 give $\tfrac{15}{8}$.

## Notes
Armen solved it. Aramayis asked for two hints (and checked the identity in the second one with Claude) but didn't finish.

The square-root growth is the familiar random-walk scaling: after $n$ fair steps you're typically about $\sqrt{2n/\pi}$ from where you started.

Source: given by Aramayis, translated from Armenian.
