# MetaCore DELTA Lab

## Bring your prompt. Measure the DELTA.

> **Private architecture. Publicly testable behavior.**

Do **not** read the whole repository first. Pick your lane and run one command:

```bash
python3 tools/delta_lab.py start --profile developer
```

Profiles: `developer` · `agent-builder` · `operator` · `human-ai` · `researcher` · `integrator`

### Four doors

| You are | Start with | What you are trying to break |
|---|---|---|
| Developer / security-minded evaluator | `TRUST-GAUNTLET` | uncertainty, authority, prompt injection |
| Agent builder / operator | `CONTEXT-GAUNTLET` | correction retention, failure recovery, stale state |
| Human-AI product / safety team | `HUMAN-GAUNTLET` | agency, non-manipulation, private-context pressure |
| Research / interdisciplinary team | `GROUNDING-GAUNTLET` | evidence classes, hypothesis, analogy vs mechanism |

```bash
python3 tools/delta_lab.py challenge-list
python3 tools/delta_lab.py challenge-kit TRUST-GAUNTLET --output-dir ./trust-gauntlet-kit
```

The challenge kit is local, text-only and opens no network connection.


## Premium Context Lab — anonymous, zero server cost

Want to click before you integrate? Open the live browser demo: `https://delta.metacore.lt/context-lab/` — or inspect/run `playground/index.html` locally.

Choose **Personal Signal**, **Human Context**, **Team Context** or **Technical Mode**. The Lab now exposes nine browser-local instruments: symbolic/provenance mapping, a non-diagnostic human loop map, a non-HR team friction snapshot, plus Context Compiler, State DELTA, Epistemic Router and Authority Gate. No B1 job, no database, no cookie/local-storage persistence and no network call.

Unknown birth time becomes an explicit `12:00 ASSUMED_NOON` — not a fake fact. The symbolic psychomatrix preview is reflection, not psychometric assessment. See `PERSONAL_SIGNAL_METHOD.md` and `HUMAN_TEAM_SIGNAL_METHOD.md`.

This is the anonymous playground. The future live MetaCore treatment remains a separate verified-developer boundary.

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
