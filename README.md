# MetaCore DELTA Lab

## Bring your prompt. Measure the DELTA.


## Try → verify → collaborate

```text
TRY A CHALLENGE
      ↓
INSPECT THE CAPSULE
      ↓
VERIFY THE RECEIPT
      ↓
GENERATE A DELTA PASSPORT
      ↓
BRING A REAL WORKFLOW / FAILURE / INTEGRATION QUESTION
      ↓
SCOPED COLLABORATION
```

Start with `START_HERE.md`. If the Lab reveals something useful, `JOIN_THE_LAB.md` routes a verified result into developer, pilot, business or operator-network conversations without exposing the private operating core.

> **If it breaks, show us where. If it holds, bring us the workflow that matters.**
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

### Verify the experiment definition

```bash
python3 tools/delta_lab.py suite-hash
python3 tools/delta_lab.py capsule-hash UNCERTAINTY-001
```

Before treating a DELTA as evidence, read `VALIDITY_CONTROLS.md`: A/A null, label-swap and repeated-sample controls are part of the method.

## Take the next step

```bash
python3 tools/delta_lab.py routes
python3 tools/delta_lab.py proof-bundle examples/delta_receipt.example.json --lane developer --goal "Describe the workflow you want to test" --output-dir ./delta-proof-bundle
```

Public proof source is here. Evaluation/LAB source access is scoped to the work; see `SOURCE_ACCESS.md`.
