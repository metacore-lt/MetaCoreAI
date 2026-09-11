# MetaCore DELTA Proof Model

MetaCore DELTA does not ask you to trust a single headline score.

```text
CAPSULE
  ↓
DECLARED CONDITIONS
  ↓
BASELINE ──────┐
               ├─ BLIND A/B → METRIC EVALUATION → RECEIPT
METACORE ──────┘
```

The public receipt can bind to:

- the exact capsule;
- the metric registry;
- the complete public suite version;
- the baseline output hash;
- the MetaCore output hash;
- the experiment class and declared conditions;
- evaluator method, confidence and limitations.

This makes the result **tamper-evident**, not infallible. A cryptographic hash proves that bytes did not change; it does not prove that an evaluator was correct. Evaluation method and limitations remain part of the result.

> **Inspect the receipt. Re-run the capsule. Challenge the methodology.**
