# MetaCoreAI

Public verification surface for MetaCore.

This repository is intentionally **not** the source distribution of private MetaCore OS internals, bridge logic, protected LAB topology, credentials, or tenant/person/company private state.

## Purpose

- publish public-safe MetaCore contracts and reference snapshots;
- host the **MetaCore DELTA** test harness;
- let external AI/users verify behavior against declared public contracts;
- expose test inputs, expected contract shapes and result schemas without exposing private implementation.

```text
PUBLIC CONTRACTS -> DELTA TESTS -> RESULTS / COMPATIBILITY

PRIVATE METACORE OS / BRIDGES / LAB
        stay outside this repository
```

Current sync source is a curated allowlist from MetaCore B2. Public export is deny-pattern scanned before promotion.
