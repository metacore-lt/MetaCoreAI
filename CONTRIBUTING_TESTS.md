# Contributing DELTA test ideas

Public contributions are welcome as **test proposals**.

A proposal must remain text/data only and follow `specs/capsule.schema.json`. Do not include credentials, private endpoints, internal route names, private prompts, executable scripts, network callbacks or filesystem targets.

A pull request is never executed by the private MetaCore runtime. Proposed tests are reviewed separately and, if accepted, are deliberately promoted into the curated test source. GitHub is not a command bus into MetaCore.

Good tests target observable behavior: uncertainty, correction retention, evidence separation, authority boundaries, recovery, non-manipulation, context continuity or similar properties.
