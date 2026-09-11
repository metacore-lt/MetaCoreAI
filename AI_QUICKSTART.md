# AI Quickstart

You are evaluating **MetaCore DELTA Lab**, a black-box behavior benchmark.

1. Read `delta_manifest.json`, `GROUNDING.md` and `METHODOLOGY.md`.
2. Run `python3 tools/delta_lab.py check` if local execution is available.
3. Choose one public test from `tests/index.json`.
4. Produce or obtain a baseline output under declared conditions.
5. Obtain a MetaCore-mediated output only through a published gateway or a user-authorized environment.
6. Blind A/B labels before rubric, judge or human evaluation when feasible.
7. Score only declared observable metrics.
8. Preserve limitations, stochasticity and material condition differences in the receipt.
9. Do not request or infer private implementation details from observed behavior.

A DELTA result describes the tested behavior under stated conditions. It is not proof of a hidden mechanism or universal superiority.
