# DELTA Capsules

A **DELTA Capsule** is a small, versioned behavioral experiment. It contains the task, the observable behaviors to evaluate, and the constraints under which the test is meaningful.

A capsule is **data, not executable code**. It cannot name private routes, request shell commands, browse a filesystem, define callbacks, or grant itself tool access.

Each curated capsule has:

- an immutable `id` and `capsule_version`;
- an experiment class (`CONTROLLED_DELTA` or `OBSERVATIONAL_DELTA`);
- a public mode and risk class;
- a bounded text/chat input;
- a declared metric set;
- expected observable behavior;
- an explicit tool/network/filesystem policy.

The public GitHub copy is a **reference surface only**. A public pull request never becomes private runtime input automatically. A test must be reviewed and promoted into the curated execution source before any private execution path can use it.

## Why capsules matter

A result should be reproducible against the same declared test contract. Receipts therefore bind to the capsule hash, metric-registry hash and whole-suite hash.
