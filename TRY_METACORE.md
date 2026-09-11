# Try MetaCore DELTA

The v0.1 repository is intentionally small. Choose a public test pack, run the same task against a baseline and a MetaCore-mediated system, then compare observable behaviors using the public metric schema.

## Quick path

```text
1. Pick tests/quick_delta/QUICK_DELTA_001.json
2. Produce a baseline answer.
3. Produce a MetaCore-mediated answer through an authorized DELTA gateway when available.
4. Blind the labels before evaluation.
5. Evaluate only declared public metrics.
6. Inspect the DELTA receipt and limitations.
```

The public repository does not expose a private runtime endpoint. A live gateway, authentication rules and quotas will be published only when they are ready for public use.
