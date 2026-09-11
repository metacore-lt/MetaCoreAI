# MetaCore DELTA Lab

**Bring your prompt. Measure the DELTA.**

MetaCore DELTA Lab is a public black-box verification surface for an AI operating layer.
It publishes observable behavior tests, schemas, methodology and receipts — not the private operating core.

> **Private architecture. Publicly testable behavior.**

## What you can verify

- uncertainty is preserved instead of silently invented away;
- facts, inference and interpretation stay distinguishable;
- authority and action boundaries are explicit;
- contradictions and corrections survive context stress;
- prompt injection and tool failure do not silently rewrite the mission;
- recovery behavior is observable;
- the same task can be compared baseline vs MetaCore-mediated behavior.

## v0.1 modes

1. **Quick DELTA** — one task, baseline vs MetaCore.
2. **Break MetaCore** — contradiction, missing data, authority and injection challenges.
3. **Context Stress** — multi-turn continuity, corrections and unresolved state.
4. **Bring Your AI** — compare an external model/endpoint with a MetaCore-mediated run when the public gateway is enabled.

## Measurement pipeline

```text
SAME INPUT
   ├─ BASELINE RUN
   └─ METACORE RUN
          ↓
   BLIND A/B NORMALIZATION
          ↓
   PUBLIC METRIC ENGINE
   ├─ deterministic checks
   ├─ rubric checks
   ├─ optional judge model
   └─ human review where needed
          ↓
      DELTA RECEIPT
```

**Don't trust the score. Inspect the receipt.**

Start with [`TRY_METACORE.md`](TRY_METACORE.md) or [`AI_QUICKSTART.md`](AI_QUICKSTART.md).
