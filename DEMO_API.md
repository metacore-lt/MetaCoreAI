# MetaCore Context Lab — zero-cost API demo

This is a **browser-local API-shaped demo** of four public MetaCore operating ideas. It does not call B1, the private operating core, a database, or any external network service.

The purpose is to let a developer click, inspect JSON and understand the operating pattern before requesting a live MetaCore treatment.

## Instruments

| Instrument | API-shaped operation | Demonstrates |
|---|---|---|
| Context Compiler | `POST /demo/v1/context/compile` | signal weighting, theme aggregation, confidence and unknowns |
| State DELTA | `POST /demo/v1/state/delta` | explicit before/after state, writeback discipline |
| Epistemic Router | `POST /demo/v1/epistemic/route` | fact / source / inference / hypothesis / symbolic separation |
| Authority Gate | `POST /demo/v1/authority/check` | authenticated actor → role → mandate → scope → approval boundary |

These are public demo algorithms, **not a clone of the private MetaCore operating implementation**.

## Cost / bot model

All four instruments run in the visitor's browser. Repeated clicks create no B1 inference jobs and no application-database writes. The browser demo performs no `fetch`, XHR, WebSocket or beacon call.

A future **Live MetaCore** button is a separate trust boundary: verified developer identity, scoped Developer Pass, hard quota, global queue and kill switch before any private treatment runtime.

## Context Compiler public demo formula

```text
signal_weight = strength × relevance × source_confidence × timing × human_context

theme_weight = average(top 3 signal_weight values for the theme)
```

This intentionally mirrors the public-safe Profile Context principle without disclosing private implementation details. Output is a contextual interpretation aid, not diagnosis or absolute truth.

## Run locally

Open `playground/index.html` in a browser. No server is required.
