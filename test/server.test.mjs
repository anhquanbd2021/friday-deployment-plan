import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const serverPath = join(dirname(fileURLToPath(import.meta.url)), "..", "app", "server.js");
const PORT = 39117;
const base = `http://localhost:${PORT}`;

let proc;
async function ready() {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch(`${base}/health`); if (r.ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 120));
  }
  throw new Error("server did not start");
}

test.before(async () => {
  proc = spawn(process.execPath, [serverPath], { env: { ...process.env, PORT: String(PORT) } });
  await ready();
});
test.after(() => proc?.kill());

test("/health returns ok", async () => {
  const r = await fetch(`${base}/health`);
  assert.equal(await r.text(), "ok");
});

test("/ serves the simulator page", async () => {
  const r = await fetch(`${base}/`);
  assert.equal(r.status, 200);
  const body = await r.text();
  assert.match(body, /Deploy Risk Simulator/);
});

test("/api/factors returns factors and presets", async () => {
  const j = await (await fetch(`${base}/api/factors`)).json();
  assert.equal(j.factors.length, 5);
  assert.ok(j.presets.meme && j.presets.boring);
});

test("/api/score scores the meme plan as an incident", async () => {
  const r = await fetch(`${base}/api/score`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ diffLines: 40000, changedPathCovered: false, rollbackRehearsed: false, featureFlag: false, someoneWatching: false }),
  });
  const j = await r.json();
  assert.ok(j.score >= 70);
});

test("/api/simulate narrates six steps", async () => {
  const r = await fetch(`${base}/api/simulate`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ diffLines: 180, changedPathCovered: true, rollbackRehearsed: true, featureFlag: true, someoneWatching: true }),
  });
  const j = await r.json();
  assert.equal(j.events.length, 6);
});
