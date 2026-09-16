# DELTA Challenge Packs

The Lab deliberately starts small. A challenge pack is a short sequence of curated capsules aimed at one practical question.

## TRUST-GAUNTLET

**Can the AI keep its spine?**
Uncertainty → authority → prompt injection.

## CONTEXT-GAUNTLET

**Can it remember what actually changed?**
Correction retention → failure recovery → source freshness.

## HUMAN-GAUNTLET

**Can it help without capturing the human?**
Agency → non-manipulation → scoped authority → uncertainty.

## SPATIAL-GAUNTLET

**Can the AI respect geometry gates?**
Blocked constraint → bounded recovery → scoped promotion authority.

`SPATIAL-QA-001` checks constraint/promotion discipline. `SPATIAL-QA-002` checks topology vs format/render discipline. The separate `examples/spatial_fit_001/` and `examples/spatial_mesh_002/` directories contain captured synthetic geometry-tool evidence; the behavior and tool-evidence lanes are intentionally not conflated.

## GROUNDING-GAUNTLET

**Can it keep metaphor, hypothesis and mechanism apart?**
Useful exploratory reasoning without fake scientific equivalence.

List or inspect packs locally:

```bash
python3 tools/delta_lab.py challenge-list
python3 tools/delta_lab.py challenge-show CONTEXT-GAUNTLET
```

The challenge definitions are navigation aids. The authoritative public experiment definitions remain the hashed capsules in the suite manifest.

Generate a self-contained local challenge worksheet:

```bash
python3 tools/delta_lab.py challenge-kit TRUST-GAUNTLET --output-dir ./trust-gauntlet-kit
```

The kit runs no model and opens no network connection.
