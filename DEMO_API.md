# MetaCore Context Lab — zero-cost API demo

This is a **browser-local API-shaped demo** of public MetaCore operating ideas. It does not call B1, the private operating core, a database, or any external network service.

The purpose is to let a developer — or a curious human — click, inspect JSON and understand the operating pattern before requesting a live MetaCore treatment.

## Four entry modes

### Personal Signal

Optional birth date + city + birth time. If time is unknown, `12:00` is inserted with evidence class `ASSUMED_NOON`.

| Instrument | API-shaped operation | Demonstrates |
|---|---|---|
| Personal Seed | `POST /demo/v1/personal/seed` | provenance, assumptions, location-resolution deferral, privacy boundary |
| Symbolic Matrix | `POST /demo/v1/personal/symbolic-matrix` | transparent Pythagorean-style symbolic number matrix |
| Personal Reflection | `POST /demo/v1/personal/reflection` | non-diagnostic symbolic questions without personality/fate claims |

See `PERSONAL_SIGNAL_METHOD.md`.

### Human Context

| Instrument | API-shaped operation | Demonstrates |
|---|---|---|
| Human Loop Map | `POST /demo/v1/human/loop-map` | self-reported trigger → touched need → reaction → breaker → next step |

This does **not** infer attachment style, personality, pathology, partner intent or relationship prognosis. Safety language stops routine pattern analysis. See `HUMAN_TEAM_SIGNAL_METHOD.md`.

### Team Context

| Instrument | API-shaped operation | Demonstrates |
|---|---|---|
| Team Friction Snapshot | `POST /demo/v1/team/friction` | decision, ownership, communication and rhythm bottlenecks |

The score is an operational friction index, not an HR or employee assessment. Safety/harassment signals stop routine optimization.

### Technical Mode

| Instrument | API-shaped operation | Demonstrates |
|---|---|---|
| Knowledge Topology Navigator | `POST /demo/v1/knowledge/route` | question → knowledge regions → epistemic classes; orientation, not proof |
| Context Compiler | `POST /demo/v1/context/compile` | signal weighting, theme aggregation, confidence and unknowns |
| State DELTA | `POST /demo/v1/state/delta` | explicit before/after state, writeback discipline; includes a spatial QA state preset |
| Epistemic Router | `POST /demo/v1/epistemic/route` | fact / source / inference / hypothesis / symbolic separation |
| Authority Gate | `POST /demo/v1/authority/check` | authenticated actor → role → mandate → scope → approval boundary |

The spatial QA preset uses the existing `state_delta` operation only. It compares declared candidate states (`unresolved_collisions`, continuity, fit residuals and promotion state); it does **not** validate geometry, infer anatomy, call Blender/solvers or promote a candidate.

The Authority Gate also carries the leadership pattern: decisions and permissions are scoped to role, mandate, impact and approval rather than inferred from personality.

The same public library map is also available as a static endpoint:

```text
GET https://delta.metacore.lt/context-lab/knowledge-topology.json
```

These are public demo algorithms, **not a clone of the private MetaCore operating implementation**.


## Guided experiment gallery

Six shareable `?exp=` presets preload existing local instruments. They are not new model capabilities.

```text
GET https://delta.metacore.lt/context-lab/experiments.json
```

The experiment manifest exposes the preset input, expected deterministic demo behavior and boundary for each scenario. See `EXPERIMENT_GALLERY.md`.


## Public catalog endpoint

```text
GET https://delta.metacore.lt/context-lab/catalog.json
```

The catalog is the machine-readable front door: instrument definitions, guided experiment links, static endpoints, topology hashes, local artifact types, public collaboration routes and hard anonymous-runtime boundaries.

## Local receipt → technical handoff

A guided experiment may emit a browser-local `metacore_context_lab_receipt_v1`. The receipt stores input/output hashes and only the minimal observed result needed to compare with the preset's declared expected behavior. It is SHA-256 checksummed locally and explicitly marked `LOCAL_SELF_CHECKSUM_ONLY_NOT_SERVER_SIGNED`.

The visitor may then create a `metacore_context_lab_handoff_v1` draft with a real workflow goal, environment, desired next step and constraints. The page does not submit or email it. Credential-like material is blocked by a narrow local guard and the visitor must confirm the no-secrets boundary. See `CONTEXT_LAB_RECEIPT.md`.

## Cost / bot model

All ten instruments run in the visitor's browser. Repeated clicks create no B1 inference jobs and no application-database writes. The browser demo performs no `fetch`, XHR, WebSocket, beacon, cookie or local-storage operation.

A future **Live MetaCore** layer is a separate trust boundary: verified identity, scoped Developer Pass, hard quota, global queue and kill switch before any private treatment runtime.

## Time precision rule

When birth time is not known, the anonymous demo uses `12:00` only as a declared technical fallback. It does not claim exact houses, exact Ascendant or other time-sensitive precision from an assumed time.

## Run locally

Open `playground/index.html` in a browser. No server is required.

Reference calculators:

```bash
python3 tools/personal_signal_demo.py --date 1990-01-01 --city Vilnius
python3 tools/human_team_signal_demo.py team \
  --stuck "Decisions bounce between owners" \
  --decision 9 --ownership 6 --communication 3 --rhythm 6
python3 tools/knowledge_topology_demo.py "robot sensor reliability"
```
