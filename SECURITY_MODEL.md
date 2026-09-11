# Security Model

MetaCore DELTA Lab follows a black-box publication boundary.

## Publicly allowed

- test inputs;
- public schemas and methodology;
- sanitized baseline and MetaCore outputs when the run owner permits publication;
- public metric results;
- evidence-class labels intended for public output;
- run metadata that does not identify private infrastructure;
- limitations and a verifiable DELTA receipt.

## Not published

- system prompts or hidden evaluator prompts;
- private routing traces or module names;
- private source code or operating-core topology;
- internal hosts, filesystem paths, ports or service identifiers;
- credentials, tokens or private keys;
- stack traces and verbose internal failures;
- private corpus fragments;
- private person, tenant or company state.

## Directionality

```text
PRIVATE RUNTIME
   │
   │ curated export only
   ▼
PUBLIC REPOSITORY
```

The repository is not a write channel into the private runtime. Future DELTA requests use a separate request gateway with input sanitation, authentication/rate controls, queueing and output sanitation.

Internal failures are reduced to public error classes such as `RUN_FAILED_INTERNAL`; private traces are not returned.
