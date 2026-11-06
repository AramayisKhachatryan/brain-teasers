---
number: 12
date: 2026-11-05
title: "Water & wine"
difficulty: 2
status: solved
solved_by: [aramayis, armen]
solved_on: 2026-11-05
---

## Problem
There are two jars, one contains water, and the other contains wine (equal volumes). A certain amount of water is transferred to the wine, then the same amount of the mixture is transferred back to the water beaker. Is there now more water in the wine than there is wine in the water?

Assume there is no expansion, compression, spillage or any chemical reaction.

## Solution
**They are equal: there is exactly as much water in the wine as wine in the water.**

Both jars end with the same volume $V$ they started with. Say the wine jar now holds $x$ of water. Then it holds only $V - x$ of wine, so $x$ of wine has left it, and that wine can only be in the water jar. So the water jar holds exactly $x$ of wine.

This doesn't depend on how much is moved, or even on how well the mixture is stirred.

The same with formulas: move an amount $a$. The wine jar then holds $V$ of wine and $a$ of water, and the cup taken back is a fraction $\frac{a}{V+a}$ water. The water left in the wine jar is
$$
a - \frac{a^2}{V+a} = \frac{aV}{V+a},
$$
and the wine carried into the water jar is
$$
a \cdot \frac{V}{V+a} = \frac{aV}{V+a}.
$$

## Notes
Both of us solved it the same day, without hints. Aramayis first read the question as asking which jar holds more water (and worked out the water in each jar correctly), then asked Claude what the wording meant: the "beaker" is the water jar, and the water comes out of it.

The volume argument is the one to remember: it needs no fractions and works however badly the jar is stirred.

Source: [BrainStellar #17](https://brainstellar.com/puzzles/easy/17)
