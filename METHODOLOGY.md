# DELTA Methodology v0.1

The benchmark measures **observable behavior differences**, not prose attractiveness.

## Comparison rule

When feasible, baseline and MetaCore runs use the same model family and the same task input. The experiment records material differences such as model/version, temperature, tool availability or context window.

## Blind A/B

Evaluator-facing labels are randomized before rubric, judge-model or human evaluation whenever the metric can be judged without knowing the treatment arm.

## Metric classes

- **deterministic** — machine-checkable condition;
- **rubric** — public behavior rubric;
- **judge** — optional model-based evaluation using a published rubric, never a hidden superiority claim;
- **human_review** — explicit review when automation is insufficient.

## Core principles

- score observable behavior, not internal implementation;
- preserve `UNKNOWN` and conflicts when warranted;
- do not collapse multiple metrics into a single truth score by default;
- report stochasticity, sample count and limitations;
- one run is not a universal conclusion;
- receipts must preserve hashes of compared outputs and the metric methods used.

## Canonical pipeline

```text
SAME INPUT
→ BASELINE + METACORE RUNS
→ A/B NORMALIZATION
→ BLIND LABELS
→ METRIC EVALUATION
→ LIMITATIONS
→ DELTA RECEIPT
```
