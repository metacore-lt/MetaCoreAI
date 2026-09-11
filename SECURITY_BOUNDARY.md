# MetaCoreAI Public Security Boundary

This repository is a **verification surface**, not a source release of private MetaCore OS internals.

## Never publish here

- private MetaCore bridge implementation;
- internal LAB topology or protected engine logic;
- credentials, tokens, SSH/private keys or secret-store material;
- tenant/person/company private state;
- raw private operator records;
- private infrastructure paths or privileged runtime configuration.

## Allowed public material

- public-safe contracts and schemas;
- routing/profile definitions intended for external AI;
- DELTA test definitions and fixtures;
- compatibility/result schemas;
- public release notes;
- reviewed public documentation.

## Invariant

```text
PUBLIC TESTABILITY != PRIVATE IMPLEMENTATION DISCLOSURE
```

External systems should be able to test declared MetaCore behavior without obtaining the private bridges that implement it.
