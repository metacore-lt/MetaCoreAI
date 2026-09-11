# Source access

MetaCore separates **verification source** from the **private operating implementation**.

The goal is not to hide behavior behind marketing. The goal is to make behavior inspectable **without publishing the operating core as a cloneable package**.

## Access ladder

### 0 · Public verification source — open

This repository: schemas, capsules, metrics, methodology, validators, hashes and public local tools. Anyone can inspect and challenge the measurement surface. Reuse rights are governed by any license or agreement explicitly applicable to the relevant artifact.

### 1 · Evaluation / integration source — scoped collaboration

For teams building an evaluator, SDK, benchmark integration or technical proof-of-concept. Availability is case-by-case and follows the exact integration scope. Start with `creator@metacore.lt` and include your DELTA Passport or capsule IDs.

### 2 · Private LAB collaboration — scoped pilot

For a real workflow, organization, research collaboration or product pilot. Access may include a purpose-built private workspace, test harness or reviewed source subset. It is not automatic access to the complete operating environment. Start with `projects@metacore.lt`.

### 3 · Operating core — managed/private

The persistent operating core, protected runtime configuration, private routing, prompts, bridges, credentials and production state are not published as a public downloadable repository. Deeper access is considered only when a legitimate project architecture requires it and the security/licensing boundary is explicitly defined.

> **Source access follows the work scope. Verification stays public; operating authority stays scoped.**

Do not request private keys, credentials, hidden prompts or production topology as a substitute for a technical evaluation. The DELTA Lab exists precisely so behavior can be tested without those disclosures.
