# MetaCore Context Lab — zero-cost API demo

This is a **browser-local API-shaped demo** of public MetaCore operating ideas. It does not call B1, the private operating core, a database, or any external network service.

The purpose is to let a developer — or a curious human — click, inspect JSON and understand the operating pattern before requesting a live MetaCore treatment.

## Two entry modes

### Personal Signal Mode

Optional birth date + city + birth time. If time is unknown, `12:00` is inserted with evidence class `ASSUMED_NOON`.

The page then exposes three local operations:

| Instrument | API-shaped operation | Demonstrates |
|---|---|---|
| Personal Seed | `POST /demo/v1/personal/seed` | provenance, assumptions, location-resolution deferral, privacy boundary |
| Symbolic Matrix | `POST /demo/v1/personal/symbolic-matrix` | transparent Pythagorean-style symbolic number matrix |
| Personal Reflection | `POST /demo/v1/personal/reflection` | non-diagnostic symbolic questions without personality/fate claims |

The symbolic matrix is **not** a validated psychometric assessment. See `PERSONAL_SIGNAL_METHOD.md`.

### Technical Mode

| Instrument | API-shaped operation | Demonstrates |
|---|---|---|
| Context Compiler | `POST /demo/v1/context/compile` | signal weighting, theme aggregation, confidence and unknowns |
| State DELTA | `POST /demo/v1/state/delta` | explicit before/after state, writeback discipline |
| Epistemic Router | `POST /demo/v1/epistemic/route` | fact / source / inference / hypothesis / symbolic separation |
| Authority Gate | `POST /demo/v1/authority/check` | authenticated actor → role → mandate → scope → approval boundary |

These are public demo algorithms, **not a clone of the private MetaCore operating implementation**.

## Cost / bot model

All seven instruments run in the visitor's browser. Repeated clicks create no B1 inference jobs and no application-database writes. The browser demo performs no `fetch`, XHR, WebSocket, beacon, cookie or local-storage operation.

A future **Live MetaCore** button is a separate trust boundary: verified developer identity, scoped Developer Pass, hard quota, global queue and kill switch before any private treatment runtime.

## Time precision rule

When birth time is not known, the anonymous demo uses `12:00` only as a declared technical fallback. It does not claim exact houses, exact Ascendant or other time-sensitive precision from an assumed time.

## Run locally

Open `playground/index.html` in a browser. No server is required.

CLI reference for the personal symbolic calculation:

```bash
python3 tools/personal_signal_demo.py --date 1990-01-01 --city Vilnius
```
