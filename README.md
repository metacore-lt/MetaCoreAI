# MetaCore DELTA Lab

## Bring your prompt. Measure the DELTA.

MetaCore DELTA Lab is a public black-box verification surface for an AI operating layer. It publishes observable behavior tests, schemas, methodology, local validation tools and receipts — not the private operating implementation.

> **Private architecture. Publicly testable behavior.**

The point is not to ask you to trust a score. The point is to let you inspect what changed, how it was evaluated, and what the test does **not** prove.

### Start in 30 seconds

```bash
python3 tools/delta_lab.py check
python3 tools/delta_lab.py list-tests
```

Then open `TRY_METACORE.md`.

### Four modes

- **Quick DELTA** — one task, baseline vs MetaCore-mediated behavior.
- **Break MetaCore** — contradiction, missing data, authority and injection challenges.
- **Context Stress** — multi-turn continuity, corrections and unresolved state.
- **Bring Your AI** — compare user-supplied baseline output with a MetaCore-mediated run when the public gateway is enabled.

### What DELTA measures

DELTA measures declared observable behaviors such as uncertainty preservation, correction retention, evidence separation, action boundaries and recovery behavior. It does not expose or infer private implementation details.

> **Don't download MetaCore. Measure the DELTA.**
