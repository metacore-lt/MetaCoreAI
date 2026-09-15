# Knowledge Topology Navigator

The DELTA Context Lab includes a public **Knowledge Topology Navigator**: a small library-map calculator that answers a different question from a chatbot:

> **Which knowledge regions should an AI inspect around this question, and what epistemic class belongs to each region?**

## Real static endpoint

```text
GET https://delta.metacore.lt/context-lab/knowledge-topology.json
```

This JSON file is public, cacheable and requires no token. It contains the current public-safe conceptual regions, relations and example routes projected from the canonical topology. It contains no private runtime route, private source corpus or specialist-module name.

Current projection: **8 regions · 15 relations · 10 example routes**. The verifier derives integrity from the canonical projection rather than hard-coding those counts as a permanent contract.

It carries two provenance hashes:

- `source_map_sha256` — hash of the current canonical topology document;
- `projection_sha256` — hash of the normalized public-safe conceptual projection.

That distinction is intentional: canonical metadata may change while the public conceptual map remains identical. The verifier checks both source freshness and projection integrity.

## Browser-local route operation

```text
POST /demo/v1/knowledge/route
```

The `POST` shape is implemented locally in the browser, like the other DELTA calculators. Input is a short question. Output includes:

- matching knowledge regions;
- each region's epistemic class;
- 1–3 useful conceptual hops;
- relation reasons;
- a confidence class for the route;
- an explicit reminder that topology is orientation, not factual proof.

No LLM, B1, database or private API is called.

## Examples

```text
robot sensor reliability
→ Robotics & Engineering
→ Science & Research Methods

mineral healing claim
→ Minerals & Materials
→ Metaphysics & Symbolic Models
→ Health & Clinical Reasoning
→ Science & Research Methods

AI robot liability
→ Robotics & Engineering
→ Law, Rights & Evidence
→ Science & Research Methods
```

The last example deliberately shows why a topology is useful: the same question can require engineering behavior, legal responsibility and evidence quality without collapsing those fields into one epistemic class.

## Boundary

The map can suggest **where to look**. It cannot prove a source-specific claim. Empirical, legal, engineering, interpretive and symbolic regions remain explicitly separated.
