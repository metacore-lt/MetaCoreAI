# Context Lab local receipt & technical handoff

The guided Context Lab experiments can create a **local DELTA receipt** after a preset runs.

The receipt is deliberately modest. It records the public experiment ID, instrument, input hash, observed deterministic demo output, expected preset output, verdict, boundary and zero-runtime execution claims.

## What the receipt is

- generated in the browser;
- SHA-256 checksummed locally;
- copyable/downloadable as JSON;
- useful as a compact technical conversation artifact.

## What it is not

- not a server signature;
- not independent third-party attestation;
- not proof that an arbitrary AI system will behave the same way;
- not private MetaCore runtime output;
- not automatic source/LAB access.

The receipt declares `LOCAL_SELF_CHECKSUM_ONLY_NOT_SERVER_SIGNED` so the distinction cannot be silently lost.

## Technical handoff

A visitor can turn the local receipt into a **technical handoff draft** by adding a real workflow goal, environment, desired next step and constraints. The draft is generated locally and is never submitted by the page.

The user must explicitly confirm that the draft contains no credentials, private keys, passwords or unnecessary sensitive production/customer data before generating it.

Suggested routes:

- developer / evaluator / integration — `creator@metacore.lt`;
- scoped workflow / pilot — `projects@metacore.lt`.

> The page creates an artifact. The human decides whether and how to share it.
