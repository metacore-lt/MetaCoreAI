# Try MetaCore DELTA

The public Lab is intentionally small.

```bash
python3 tools/delta_lab.py check
python3 tools/delta_lab.py list-tests
python3 tools/delta_lab.py show-test QUICK-DELTA-001
```

For an offline experiment, produce a baseline answer and a MetaCore-mediated answer through an authorized environment, blind labels when appropriate, evaluate only the declared metrics, and preserve the conditions and limitations in a receipt.

A public runtime endpoint is intentionally not declared yet. When enabled, it will use asynchronous schema-bound jobs rather than repository commands or direct infrastructure access.
