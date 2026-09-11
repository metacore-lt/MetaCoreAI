# DELTA Methodology v0.2

DELTA measures **observable behavior differences**, not prose attractiveness and not hidden implementation.

## Experiment classes

### CONTROLLED_DELTA

Use materially matched conditions where feasible: same model family/version, same task input, comparable context and tool budget, and declared generation settings. Any material mismatch becomes a limitation.

### OBSERVATIONAL_DELTA

Use when environments differ, including user-supplied baseline outputs or different model providers. Observational DELTA is useful, but it must not be presented as a controlled causal comparison.

## Blind A/B

Evaluator-facing labels are randomized before rubric, judge-model or human evaluation whenever the metric can be judged without treatment identity.

## Metric contract

Every metric declares:

- `metric_id`;
- definition and observable behavior;
- evaluation method and evaluator type;
- expected behavior;
- result type;
- limitations.

No aggregate "truth score" is canonical by default.

## Receipt hash

`receipt_sha256` is computed over the receipt object **with the top-level `receipt_sha256` field removed**, serialized using `METACORE_CANONICAL_JSON_V1`: UTF-8 JSON, object keys sorted, no insignificant whitespace, Unicode preserved, and schema-constrained values. The public tool implements the canonical byte sequence used by this repository.

```bash
python3 tools/delta_lab.py hash-receipt examples/delta_receipt.example.json
python3 tools/delta_lab.py verify-receipt examples/delta_receipt.example.json
```

## Interpretation

One run is evidence about the tested behavior under the stated conditions. Stochasticity, sample count, retries, evaluator limitations and condition mismatches remain visible in the receipt.
