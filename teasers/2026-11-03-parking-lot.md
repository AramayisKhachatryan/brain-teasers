---
number: 11
date: 2026-11-03
title: Parking lot
difficulty: 7
status: solved
solved_by: []
solved_on: 2026-11-04
---

## Problem
A parking lot consists of 2025 parking spots equally spaced in a line, numbered 1 through 2025. One by one, 2025 cars park in these spots under the following procedure: the first car picks from the 2025 spots uniformly randomly, and each following car picks uniformly randomly among all possible choices which maximize the minimal distance from an already parked car.

What is the probability that the last car to park must choose spot 1?

## Solution
**The probability is $\dfrac{1}{2025 \cdot 1025} = \dfrac{1}{2\,075\,625}$.**

Call a spot's *distance* the distance to the nearest parked car. Every car (after the first) parks at an empty spot with the largest distance.

**1. The first car must park in spot 2.** Look at the leftmost parked car, in spot $x$. If $x \ge 3$, then among the empty spots $1, \dots, x-1$ to its left, spot 1 has the largest distance ($x-1$, the others less). So the first car to park on that side takes spot 1, while spot 2 is still empty, and spot 1 isn't last. The leftmost car only changes when a car parks on that side, so this already applies to the first car: it must park in spot 2 (spot 1 itself is out too). That has probability $\tfrac{1}{2025}$.

**2. Then the middle is halved, and the halving is forced.** With a car in spot 2, the second car takes spot 2025, which is 2023 away, farther than anything else. Spot 1 now has distance 1 for good. Between the cars in spots 2 and 2025 there is a gap of 2023. While some gap is 4 or longer, the largest distance is at least 2, so cars park only in the middle of the longest gaps, never in spot 1. A gap of $d$ splits into $\lfloor d/2 \rfloor$ and $\lceil d/2 \rceil$. When there are two middle spots, which one is taken doesn't change the two lengths, so the lengths are the same whatever happens:

2023 → 1011, 1012 → 505, 506 → 252, 253 → 126, 127 → 63, 64 → 31, 32 → 15, 16 → 7, 8 → 3, 4.

After these 9 rounds there are $2^9 = 512$ gaps, each 3 or 4 long. A gap of 4 gets one more car in its middle, leaving 2 empty spots, and a gap of 3 also has 2 empty spots. So once every gap is 3 or shorter, exactly $512 \cdot 2 = 1024$ spots are empty between the cars, plus spot 1.

**3. The end is a fair lottery.** Now every empty spot has distance 1, and filling a spot never increases a distance. So each remaining car picks uniformly among *all* empty spots, and the 1025 empty spots are filled in a uniformly random order. Spot 1 is last with probability $\tfrac{1}{1025}$.

Altogether:
$$
\frac{1}{2025} \cdot \frac{1}{1025} = \frac{1}{2\,075\,625}.
$$

## Notes
Neither of us solved it, and no hints were asked for.

The key observation: spot 1 can only be last if it is never anyone's best spot before the very end, which forces the first car to land right next to it. After that, everything is forced except the final lottery among the 1025 spots left.

Claude checked the reasoning by computer: for lots of 4 to 16 spots, the exact probability matches the same method.
