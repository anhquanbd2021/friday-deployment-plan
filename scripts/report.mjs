// report.mjs — replay the article's three presets side by side.
// Usage: node scripts/report.mjs
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { score, simulate } from "../public/risk.mjs";

const presets = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "examples", "presets.json"), "utf8"),
);

for (const [key, p] of Object.entries(presets)) {
  const r = score(p);
  const s = simulate(p);
  console.log(`\n=== ${p.label} (${key}) — risk ${r.score}/100 — ${r.verdict}`);
  for (const d of r.drivers) console.log(`   +${String(d.points).padStart(2)}  ${d.factor} — ${d.detail}`);
  for (const e of s.events) console.log(`   ${e.step}. ${e.text} → ${e.outcome}`);
}
