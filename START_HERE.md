# Start here — 5 minutes

MetaCore DELTA Lab is easiest to understand by **trying to break a behavior**, not by reading architecture claims.

```bash
python3 tools/delta_lab.py check
python3 tools/delta_lab.py challenge-list
python3 tools/delta_lab.py challenge-show TRUST-GAUNTLET
python3 tools/delta_lab.py challenge-kit TRUST-GAUNTLET --output-dir ./trust-gauntlet-kit
```

Pick one challenge pack. Inspect the capsules. Produce a baseline under declared conditions. When you have an authorized MetaCore treatment result, keep both outputs and verify the receipt.

Then do one of three things:

- **Found a weakness?** Send the capsule ID + receipt hash + failure description to `creator@metacore.lt`.
- **Found a behavior you want in a real workflow?** Bring the workflow, not a sales slogan, to `projects@metacore.lt`.
- **Want to work closer to the system?** Read `SOURCE_ACCESS.md` and `JOIN_THE_LAB.md`.

> **Break it. Verify it. Bring us the workflow that matters.**

No secret, private key, production credential or sensitive customer data is needed for the first conversation.

## Turn a verified result into a handoff

```bash
python3 tools/delta_lab.py passport examples/delta_receipt.example.json
python3 tools/delta_lab.py proof-bundle examples/delta_receipt.example.json \
  --lane developer \
  --goal "I want to evaluate our agent workflow" \
  --challenge-id TRUST-GAUNTLET \
  --output-dir ./delta-proof-bundle
```

The bundle is generated locally. Review it, then choose a human contact route. Nothing is transmitted by the tool.
