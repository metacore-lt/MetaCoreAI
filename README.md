# MetaCore DELTA Lab

> **Private architecture. Publicly testable behavior.**

## ▶ Start here: [Open the live Context Lab](https://delta.metacore.lt/context-lab/)

**No account · no token · no B1 job · no database write.** The anonymous Lab currently exposes **10 browser-local instruments**. Click first; inspect the JSON second; read architecture only if you want to go deeper.

| Instrument | API-shaped operation | What it demonstrates |
|---|---|---|
| Personal Seed | `POST /demo/v1/personal/seed` | user input vs assumption vs unknown |
| Symbolic Matrix | `POST /demo/v1/personal/symbolic-matrix` | transparent symbolic calculation, not psychometrics |
| Personal Reflection | `POST /demo/v1/personal/reflection` | reflective prompt without diagnosis/fate claims |
| Human Loop Map | `POST /demo/v1/human/loop-map` | trigger → need → reaction → breaker → next step |
| Team Friction | `POST /demo/v1/team/friction` | decision · ownership · communication · rhythm |
| **Knowledge Topology** | `POST /demo/v1/knowledge/route` | question → knowledge regions → epistemic classes |
| Context Compiler | `POST /demo/v1/context/compile` | signal weighting + confidence + unknowns |
| State DELTA | `POST /demo/v1/state/delta` | explicit before/after state |
| Epistemic Router | `POST /demo/v1/epistemic/route` | fact / source / inference / hypothesis / symbolic |
| Authority Gate | `POST /demo/v1/authority/check` | actor → mandate → scope → approval |

The Knowledge Topology also has a real, static, token-free endpoint:

```text
GET https://delta.metacore.lt/context-lab/knowledge-topology.json
```

It is a **library map, not a hidden expert API**. It can suggest where to look; it cannot prove a claim. See `KNOWLEDGE_TOPOLOGY_DEMO.md`.

### Prefer the benchmark / CLI path?

```bash
python3 tools/delta_lab.py start --profile developer
python3 tools/delta_lab.py challenge-list
python3 tools/delta_lab.py challenge-kit TRUST-GAUNTLET --output-dir ./trust-gauntlet-kit
```

Profiles: `developer` · `agent-builder` · `operator` · `human-ai` · `researcher` · `integrator`

The browser source is in `playground/`. Everything there is inspectable; the private operating implementation is not published.

## Try → verify → collaborate

```text
TRY A CHALLENGE
      ↓
INSPECT THE CAPSULE
      ↓
VERIFY THE RECEIPT
      ↓
GENERATE A DELTA PASSPORT
      ↓
BRING A REAL WORKFLOW / FAILURE / INTEGRATION QUESTION
      ↓
SCOPED COLLABORATION / SOURCE PATH
```

If it breaks, show us where. If it holds, bring us the workflow that matters.

- Failure / evaluator / integration: `creator@metacore.lt`
- Scoped workflow / pilot: `projects@metacore.lt`
- Operator / group path: `https://networker.metacore.lt/`
- Talk to MetaCore / Quantara: `https://chat.metacore.lt/`
- Source and LAB access model: `SOURCE_ACCESS.md`

No credential, private key or sensitive production dataset belongs in the first contact.

## What this repository is

MetaCore DELTA Lab is a public black-box verification surface for an AI operating layer. It publishes observable behavior tests, schemas, methodology, local validation tools and receipts — **not** the private operating implementation.

The point is not to ask you to trust a score. The point is to let you inspect what changed, how it was evaluated, and what the test does **not** prove.

### Four DELTA modes

- **Quick DELTA** — one task, baseline vs MetaCore-mediated behavior.
- **Break MetaCore** — contradiction, missing data, authority and injection challenges.
- **Context Stress** — multi-turn continuity, corrections and unresolved state.
- **Bring Your AI** — user-supplied baseline vs MetaCore-mediated treatment when the public gateway is enabled.

The live gateway is currently disabled while its remaining security/state/dispatch gates are being completed.

## Verify the measurement

```bash
python3 tools/delta_lab.py check
python3 tools/delta_lab.py suite-hash
python3 tools/delta_lab.py capsule-hash UNCERTAINTY-001
python3 tools/delta_lab.py verify-receipt examples/delta_receipt.example.json
```

Read `VALIDITY_CONTROLS.md` before treating a DELTA as evidence. A/A null, label-swap, repeated-sample, predeclared-metric and evaluator-disagreement controls are part of the method.

## Turn evidence into a technical conversation

```bash
python3 tools/delta_lab.py passport examples/delta_receipt.example.json
python3 tools/delta_lab.py proof-bundle examples/delta_receipt.example.json \
  --lane developer \
  --goal "Describe the real workflow you want to test" \
  --output-dir ./delta-proof-bundle
```

The Proof Bundle is generated locally. It does not send data anywhere.

> **Don't download MetaCore. Measure the DELTA.**

Then choose the next path: `START_HERE.md` · `JOIN_THE_LAB.md` · `SOURCE_ACCESS.md` · `IP_BOUNDARY.md`.
