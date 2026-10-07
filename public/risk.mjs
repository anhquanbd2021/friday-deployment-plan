// risk.mjs — deploy risk model. Score a deploy from the inputs the meme
// pretends don't exist: diff size, coverage of the changed path, rollback
// readiness, feature flag, and whether anyone is watching.
// Pure module: shared by app/server.js, the browser UI, and tests.

export const FACTORS = [
  { id: "diffLines", name: "diff size (lines)", kind: "number", note: "the meme's +40,000" },
  { id: "changedPathCovered", name: "changed path covered by tests", kind: "bool", note: "green CI only means what it covers" },
  { id: "rollbackRehearsed", name: "rollback rehearsed", kind: "bool", note: "not 'redeploy the old version' — actually run before" },
  { id: "featureFlag", name: "behind a flag", kind: "bool", note: "deploy ≠ release" },
  { id: "someoneWatching", name: "a human is watching", kind: "bool", note: "dashboards open, alerts armed" },
];

// presets from the article
export const PRESETS = {
  meme: {
    label: "The meme plan",
    diffLines: 40000, changedPathCovered: false, rollbackRehearsed: false,
    featureFlag: false, someoneWatching: false,
  },
  boring: {
    label: "The boring deploy",
    diffLines: 180, changedPathCovered: true, rollbackRehearsed: true,
    featureFlag: true, someoneWatching: true,
  },
  friday: {
    label: "Friday, controls on",
    diffLines: 40000, changedPathCovered: true, rollbackRehearsed: true,
    featureFlag: true, someoneWatching: true,
  },
};

// returns { score: 0..100, verdict, drivers: [{factor, points, detail}] }
export function score(input) {
  const drivers = [];
  let score = 0;

  // diff size: log-scaled, the single biggest driver
  const lines = Math.max(0, Number(input.diffLines) || 0);
  const diffPts = Math.min(40, Math.round(Math.log10(lines + 1) * 8));
  drivers.push({
    factor: "diffLines", points: diffPts,
    detail: `${lines.toLocaleString()} lines — ${lines > 2000 ? "nobody can review this" : lines > 400 ? "hard to hold in your head" : "holdable"}`,
  });
  score += diffPts;

  if (!input.changedPathCovered) {
    drivers.push({ factor: "changedPathCovered", points: 20, detail: "the risky path isn't in the suite — green is a mood" });
    score += 20;
  }
  if (!input.rollbackRehearsed) {
    drivers.push({ factor: "rollbackRehearsed", points: 15, detail: "an unrehearsed rollback is a hope" });
    score += 15;
  }
  if (!input.featureFlag) {
    drivers.push({ factor: "featureFlag", points: 15, detail: "deploy and release are the same event" });
    score += 15;
  }
  if (!input.someoneWatching) {
    drivers.push({ factor: "someoneWatching", points: 10, detail: "the first error sits until Monday" });
    score += 10;
  }

  score = Math.min(100, score);
  const verdict =
    score >= 70 ? "incident waiting for a quiet weekend" :
    score >= 45 ? "ship it and hold your breath" :
    score >= 25 ? "probably fine, someone will still check Monday" :
    "boring — ship it any day you like";
  return { score, verdict, drivers };
}

// what the meme's chain of events looks like under each preset
export function simulate(input) {
  const r = score(input);
  const events = [
    { step: 1, text: "add one tiny feature", outcome: linesEvent(input.diffLines) },
    { step: 2, text: "it touches three working things", outcome: input.changedPathCovered ? "caught by tests before deploy" : "silently ships" },
    { step: 3, text: "ask AI to fix it", outcome: "+40,000 lines nobody reviewed" },
    { step: 4, text: "ship it anyway", outcome: input.featureFlag ? "dark launch — flag off, blast contained" : "live immediately" },
    { step: 5, text: "Friday evening", outcome: input.someoneWatching ? "an anomaly fires, a human sees it" : "the error waits for Monday" },
    { step: 6, text: "rollback?", outcome: input.rollbackRehearsed ? "rehearsed path, three minutes" : "improvise under incident lighting" },
  ];
  return { ...r, events };
}

function linesEvent(lines) {
  const n = Number(lines) || 0;
  return n > 2000 ? `"tiny" is doing a lot of work — ${n.toLocaleString()} lines` : "actually tiny";
}
