---
date: 2026-10-25
title: Drunk airline passenger
status: solved
solved_by: [armen]
solved_on: 2026-10-25
---

## Problem
A line of 100 airline passengers is waiting to board a plane. They each hold a ticket to one of the 100 seats on that flight. For convenience, let's say that the n-th passenger in line has a ticket for seat number n.

Being drunk, the first person in line picks a random seat (equally likely for each seat). All of the other passengers are sober, and will go to their assigned seats unless it is already occupied. If it is occupied, they will then find a free seat to sit in, at random.

What is the probability that the last (100th) person to board the plane will sit in their own seat (#100)?

## Solution
**1/2.** Only two seats matter: seat 1 (the drunk passenger's own seat) and seat 100 (the last passenger's seat).

1. Someone only picks a seat at random when their own seat is taken. Call that person "displaced". The first passenger counts as displaced too.
2. Whenever a displaced passenger picks, seat 1 and seat 100 are both still free and equally likely to be chosen. Any other seat just displaces someone else later, who picks at random again.
3. The story ends the moment seat 1 or seat 100 is taken:
   - **Seat 1 taken first:** the chain of displacement stops. Every remaining passenger finds their own seat free, including passenger 100.
   - **Seat 100 taken first:** passenger 100 can't get their seat and ends up in seat 1.
4. One of the two is always taken before passenger 100 boards, and at every step they are equally likely. So passenger 100 gets their own seat with probability **1/2**.

The answer doesn't depend on the number of passengers (for 2 or more). Quick check with 2 passengers: the drunk picks seat 1 or seat 2 with equal chance, so 1/2. And when passenger 100 doesn't get their own seat, they always sit in seat 1, never anywhere else.

## Notes
Armen solved it the same day, without hints. Aramayis didn't get it.
