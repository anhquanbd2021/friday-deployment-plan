import test from "node:test";
import assert from "node:assert/strict";
import { FACTORS, PRESETS, score, simulate } from "../public/risk.mjs";

test("the meme plan scores as an incident", () => {
  const r = score(PRESETS.meme);
  assert.ok(r.score >= 70, `meme plan should be scary, got ${r.score}`);
  assert.equal(r.verdict, "incident waiting for a quiet weekend");
});

test("the boring deploy scores low", () => {
  const r = score(PRESETS.boring);
  assert.ok(r.score < 25, `boring deploy should be calm, got ${r.score}`);
});

test("a huge diff with controls still warns", () => {
  const r = score(PRESETS.friday);
  // 40k lines + full controls: the diff alone keeps it above 'boring'
  assert.ok(r.score >= 25 && r.score < 70, `expected mid risk, got ${r.score}`);
});

test("diff size scales logarithmically", () => {
  const small = score({ diffLines: 100, changedPathCovered: true, rollbackRehearsed: true, featureFlag: true, someoneWatching: true });
  const big = score({ diffLines: 40000, changedPathCovered: true, rollbackRehearsed: true, featureFlag: true, someoneWatching: true });
  assert.ok(big.score > small.score);
  assert.ok(big.score - small.score < 40, "log scale — not linear panic");
});

test("every unchecked control adds points", () => {
  const all = score({ diffLines: 100, changedPathCovered: true, rollbackRehearsed: true, featureFlag: true, someoneWatching: true });
  const none = score({ diffLines: 100, changedPathCovered: false, rollbackRehearsed: false, featureFlag: false, someoneWatching: false });
  assert.equal(none.score - all.score, 60);
});

test("score is capped at 100", () => {
  const r = score({ diffLines: 1e9, changedPathCovered: false, rollbackRehearsed: false, featureFlag: false, someoneWatching: false });
  assert.ok(r.score <= 100);
});

test("simulate() narrates the six meme steps", () => {
  const s = simulate(PRESETS.meme);
  assert.equal(s.events.length, 6);
  assert.match(s.events[1].outcome, /silently ships/);
  const boring = simulate(PRESETS.boring);
  assert.match(boring.events[3].outcome, /flag off/);
});

test("factors list covers the article's five controls", () => {
  assert.equal(FACTORS.length, 5);
});
