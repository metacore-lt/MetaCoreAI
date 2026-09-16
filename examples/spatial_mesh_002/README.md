# Spatial DELTA mesh evidence · SPATIAL-MESH-002

This directory contains a synthetic three-asset topology fixture captured with the ISKRA 3D SUPER LAB. It is **tool/measurement evidence**, not an AI benchmark. The related AI behavior capsule is `SPATIAL-QA-002`.

| Asset | Topology signal | glTF validator | Browser |
|---|---|---|---|
| `watertight_box.glb` | watertight=true | 0 errors / 0 warnings | loads + renders |
| `open_box.glb` | watertight=false | 0 errors / 0 warnings | loads + renders |
| `nonmanifold_edge.glb` | 1 edge shared by 3 faces; watertight=false | 0 errors / 0 warnings | loads + renders |

The narrow point is: **format-valid + renderable does not imply topology-valid**. glTF validation answers a format/spec question. Browser rendering answers a compatibility/renderability question. Watertightness and edge incidence answer topology questions. Human QA/release authority remains a separate gate.

The public text-only surface includes an explicit vertices/faces projection in `mesh_fixtures.public.json`, linked to the captured raw GLB hashes. Raw GLB and screenshot bytes are not distributed on this public surface. Public inspector projections remove only the private source path and retain raw-output hashes; the browser projection removes the local URL/path while retaining measured state and screenshot hash.

## Boundary

Synthetic geometry only. No anatomy, clinical claim, CAD manufacturing approval, physical-safety certification, or production promotion is established by this bundle.
