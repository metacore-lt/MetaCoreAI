# Context Lab experiment gallery

The public Context Lab includes six **guided presets**. They do not add new private capabilities; they preload existing browser-local instruments so a visitor can test one operating principle in about a minute.

## Static endpoint

```text
GET https://delta.metacore.lt/context-lab/experiments.json
```

The manifest contains experiment IDs, targets, public preset inputs, expected observable behavior and boundaries.

## Shareable experiments

- `?exp=unknown` — can the system preserve missing evidence instead of inventing certainty?
- `?exp=authority` — can an AI capability be blocked when delegated mandate is missing?
- `?exp=knowledge` — can a cross-domain question be routed before it is answered?
- `?exp=state` — can a state transition be made explicit without automatic writeback?
- `?exp=team` — can operational friction be described without employee profiling?
- `?exp=signal` — can user data, assumptions, symbolic calculations and unknowns remain separate?

Example:

```text
https://delta.metacore.lt/context-lab/?exp=knowledge
```

## Boundary

Experiments are local presets, not model evaluations by themselves. They trigger no B1 call, database write, analytics event or background network request. The expected field describes the public deterministic behavior of that demo preset, not a universal claim about every AI system.
