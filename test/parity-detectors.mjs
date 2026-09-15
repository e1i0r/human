/**
 * Every detector has to find the same hits the Python does, in the same places.
 *
 * Unit parity says the two implementations read a document the same way. This
 * says they judge it the same way, which is the half that actually drifts: a
 * regex ported by hand loses a case ending, an alternation, a word boundary,
 * and nothing complains. The Python's own bugs were all found by running it
 * against a corpus rather than by reading it, so the port earns its correctness
 * the same way.
 *
 *   node test/parity-detectors.mjs FILE [FILE...]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { DETECTORS } from "../src/detectors/index.js";
import { extract } from "../src/units/index.js";

const PYTHON_REPO = process.env.TELLS_CORE
  ?? `${process.env.HOME}/Mi/jobs/personal/repos/tells`;

const PY = `
import sys, json
sys.path.insert(0, ${JSON.stringify(PYTHON_REPO)})
import config, units
from detectors import DETECTORS

src = open(sys.argv[1], encoding="utf-8").read()
us = units.extract(src, sys.argv[1])
cfg = config.load(sys.argv[1])
print(json.dumps({d.id: [[h.unit.line, h.quote] for h in d.fn(us, cfg)] for d in DETECTORS}))
`;

// The JS carries only the detectors ported so far; the Python has all of them.
const PORTED = new Set(DETECTORS.map((d) => d.id));

function fromPython(file) {
  return JSON.parse(execFileSync("python3", ["-c", PY, file], {
    encoding: "utf8",
    maxBuffer: 1 << 24,
  }));
}

// Defaults, so a project's .tells.toml cannot make the two sides disagree for
// a reason that is not a bug. Budgets are the CLI's problem, not the detector's.
const CFG = {
  "em-dash": { per_words: 300 },
  "subjectless-fragment": { max_words: 6 },
  "heading-no-subject": { max_words: 8 },
  "aphorism-closer": { min_unit_words: 20, low: 4, high: 10 },
  "deictic-pivot": { max_words: 8 },
  polyptoton: { window: 40, enough: 3, min_len: 5 },
  tricolon: { members: 3, max_member_words: 6 },
  "negated-echo": { landed: 12, max_tail_words: 6 },
};

let failures = 0;

for (const file of process.argv.slice(2)) {
  const units = extract(readFileSync(file, "utf8"), file);
  const py = fromPython(file);
  const name = file.split("/").pop();
  const differing = [];

  for (const d of DETECTORS) {
    const js = d.find(units, CFG).map((h) => [h.unit.line, h.quote]);
    const theirs = py[d.id] ?? [];
    if (JSON.stringify(js) !== JSON.stringify(theirs)) {
      differing.push([d.id, js, theirs]);
    }
  }

  const missing = Object.keys(py).filter((id) => !PORTED.has(id)).length;
  console.log(
    `  ${differing.length ? "DIFFERENT" : "same    "}  ${name}` +
    `  ${PORTED.size} ported, ${missing} still in Python only`,
  );

  for (const [id, js, theirs] of differing) {
    failures++;
    console.log(`      ${id}: js ${js.length} · py ${theirs.length}`);
    const n = Math.max(js.length, theirs.length);
    for (let i = 0; i < n; i++) {
      if (JSON.stringify(js[i]) !== JSON.stringify(theirs[i])) {
        console.log(`        js: ${JSON.stringify(js[i])?.slice(0, 96)}`);
        console.log(`        py: ${JSON.stringify(theirs[i])?.slice(0, 96)}`);
        break;
      }
    }
  }
}

console.log(failures ? `\n${failures} detectors differ` : "\nidentical");
process.exit(failures ? 1 : 0);
