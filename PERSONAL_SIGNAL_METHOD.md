# Personal Signal Mode — public method

Personal Signal Mode is an optional, browser-local demonstration of how MetaCore can keep **input provenance, assumptions, symbolic models and unknowns separate**.

## Inputs

- birth date — user-provided;
- birth city — user-provided text, not geocoded in the anonymous demo;
- birth time — optional. If omitted, the demo assigns `12:00` and marks it `ASSUMED_NOON`.

The anonymous demo sends none of these values to B1, a database or an external service. It does not use cookies, local storage or background network requests.

## Symbolic Number Matrix

The public demo uses a transparent **Pythagorean-style psychomatrix preview**. It is a symbolic/numerological calculation, not a validated psychometric or psychological assessment.

The calculation uses the date digits plus four traditional working numbers:

1. `A = sum(all birth-date digits)`
2. `B = sum(digits of A)`
3. `C = A - 2 × first non-zero digit of birth day`
4. `D = sum(digits of C)`

Digits `1..9` from the birth date and working numbers are counted into a 3×3 matrix. Zero is ignored.

The demo also shows a reduced main number, active/missing digits, repetition score and matrix density. These are **symbolic reflection outputs**, not traits, diagnoses or predictions.

## Time precision gate

If birth time is unknown and `12:00` is assigned:

- exact Ascendant is not claimed;
- exact houses are not claimed;
- time-sensitive lunar/angle precision is not claimed;
- city is preserved only as a declared input for a future verified calculation.

The point of the demo is epistemic discipline: **ASSUMED is not promoted to VERIFIED**.

## What a later live calculation may add

A separately gated live layer may resolve city/timezone and calculate astronomical positions, cycles or a fuller context profile. That path is not part of the anonymous browser demo and remains subject to quota, privacy, retention and runtime controls.
