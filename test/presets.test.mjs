import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PRESETS } from "../public/risk.mjs";

const file = join(dirname(fileURLToPath(import.meta.url)), "..", "examples", "presets.json");
const examples = JSON.parse(readFileSync(file, "utf8"));

test("examples/presets.json stays in sync with the model's PRESETS", () => {
  assert.deepEqual(Object.keys(examples).sort(), Object.keys(PRESETS).sort());
  for (const k of Object.keys(PRESETS)) assert.deepEqual(examples[k], PRESETS[k]);
});
