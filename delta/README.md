# MetaCore DELTA

Public black-box / contract-level test surface for MetaCore.

Goal: verify declared behavior and compatibility **without exposing private MetaCore OS bridge implementation**.

Initial structure:

```text
delta/
  contracts/     # public test contracts
  fixtures/      # public-safe test inputs
  schemas/       # result/compatibility schemas
  results/       # optional public result snapshots
```

The specific DELTA test catalogue will be defined separately. Until then, this directory is the stable public harness boundary.
