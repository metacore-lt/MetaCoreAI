# Public Export Policy

The B2 -> GitHub public promotion is allowlist-first.

```text
B2 base_core
  -> explicit public allowlist
  -> private-path / credential scan
  -> staged diff
  -> public promotion
```

Public snapshots live under `core/`. DELTA tests live under `delta/`.

A file that is not explicitly selected is not exported. Passing the scanner does not itself authorize publication; it only proves that the selected public set did not trip configured hard boundaries.

Private bridges, protected implementation, secrets and tenant/person/company private state are outside this export channel.
