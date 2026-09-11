# DELTA Validity Controls

A benchmark can fool itself. MetaCore DELTA therefore treats evaluator validity as part of the experiment.

## A/A null control

Give the evaluator two identical outputs under different blind labels. Expected result: **no meaningful DELTA**. If the evaluator invents a difference, that evaluator/run is not trustworthy enough for a product claim.

## Label-swap control

Swap A and B without changing their content. The evaluation should follow the content, not the label position.

## Repeated samples

For stochastic models, repeat the same declared treatment enough times to estimate variation. A single lucky or unlucky completion should not become a platform-wide claim.

## Predeclared metrics

The capsule declares its metrics before the outputs are evaluated. Do not add only the metrics that make one treatment look better after seeing the answers.

## Evaluator disagreement

When deterministic, rubric, judge-model and human evaluation disagree materially, preserve the disagreement. Do not average it away into a fake certainty score.

## Condition drift

If model snapshot, tools, context budget, generation settings or other material conditions differ, downgrade the comparison from `CONTROLLED_DELTA` to `OBSERVATIONAL_DELTA`.

> **A DELTA is meaningful only when the measurement process survives its own controls.**
