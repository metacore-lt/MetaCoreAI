# Join the MetaCore work

If DELTA is interesting, the best next step is not “tell me more.” Bring one thing we can examine together.

## If you found a failure

Send:

- capsule/test ID;
- receipt hash or exact public suite hash;
- what you expected;
- what happened;
- the minimum reproduction conditions.

Route: `creator@metacore.lt`

## If you found a workflow worth testing

Send:

- the real job you want AI to perform;
- where context/state currently gets lost;
- what can and cannot be automated;
- the consequence of a wrong answer/action;
- what a useful DELTA pilot would need to prove.

Route: `projects@metacore.lt`

## If you want the operator / group path

Explore `https://networker.metacore.lt/` or start a conversation through `https://chat.metacore.lt/`.

## If you want source or integration access

Read `SOURCE_ACCESS.md`. Public proof source is already here. Deeper evaluation/LAB source is scoped to the work rather than published as the full private operating core.

You can generate a compact technical handoff from a verified receipt:

```bash
python3 tools/delta_lab.py handoff examples/delta_receipt.example.json --lane developer --goal "I want to test this against our agent workflow"
```

The command only prints a local brief. It does not send data anywhere.
