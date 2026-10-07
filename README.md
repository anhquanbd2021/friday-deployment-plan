# Deploy Risk Simulator — companion demo

Interactive lab for the article *The Friday Deploy Checklist Is a Joke Until It
Isn't*. Score a deploy from the five controls the meme pretends don't exist —
diff size, changed-path coverage, rehearsed rollback, feature flag, human
watching — then replay the meme's six steps and watch where each control (or
its absence) lands you.

Zero dependencies — Node 20+ only. `public/risk.mjs` is the scoring model,
shared by the server, the browser UI, the report script, and the tests.

## Presets

| Preset | Score shape |
|---|---|
| The meme plan | 40k-line diff, no controls → incident waiting for a quiet weekend |
| Friday, controls on | same 40k diff, all controls → survivable, but the diff still warns |
| The boring deploy | small diff, tested, flagged, rehearsed, watched → ship it any day |

## Run it

```text
npm start                    # simulator on :3000
npm test                     # scoring invariants + API surface
node scripts/report.mjs      # all three presets side by side in the terminal
```

`examples/presets.json` is the scenario file the report reads — it is kept in
sync with the model's `PRESETS` by a dedicated test.
