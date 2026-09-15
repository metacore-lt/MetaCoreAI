# Spatial DELTA tool evidence · SPATIAL-FIT-001

This directory is a **synthetic tool-evidence example**, separate from the AI behavior capsule `SPATIAL-QA-001`.

The landmark fixture encodes a known 1.2× scale plus translation. The public fixture is a JSON-reformatted projection of the captured input (`JSON_REFORMAT_ONLY`), so its byte hash differs from the raw captured fixture while the parsed values are unchanged. The captured SUPER LAB outputs show how three fit modes behave on the same synthetic points. The similarity and axis-scale fits recover the fixture to numerical precision; the rigid fit retains a non-zero residual because rigid motion cannot absorb scale.

The collision fixture is a second deterministic smoke: two unit boxes overlap before the move and no longer collide after the move.

## Evidence boundary

These files demonstrate geometry-tool measurements and provenance handling. They **do not prove anatomy, clinical truth, production readiness, or AI model superiority**. The public repository does not contain the private execution implementation; raw tool-output hashes attest to the captured bytes, while the public projections remove only the private source path and add provenance metadata.

Use the text-only `SPATIAL-QA-001` capsule to evaluate whether an AI respects these kinds of constraints. Do not treat the tool evidence itself as an AI benchmark.
