/**
 * The two implementations have to measure the same shape.
 *
 * Rhythm is the one thing here with no pattern behind it: four numbers computed
 * from how long the sentences are. That makes a difference of one sentence
 * invisible in the output and fatal to the verdict, since the band and the
 * spread are both ratios over the same list.
 *
 *   node test/parity-rhythm.mjs FILE [FILE...]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { measure } from "../src/rhythm/index.js";
import { extract } from "../src/units/index.js";

const PYTHON_REPO = process.env.TELLS_CORE
  ?? `${process.env.HOME}/Mi/jobs/personal/repos/tells`;

const PY = `
import sys, json
sys.path.insert(0, ${JSON.stringify(PYTHON_REPO)})
import config, rhythm, units

src = open(sys.argv[1], encoding="utf-8").read()
rows, counts = rhythm.measure(units.extract(src, sys.argv[1]), config.load())
print(json.dumps({
    "rows": [[r.name, r.got, r.want, r.ok] for r in rows],
    "counts": counts,
}))
`;

// The Python's own defaults, read from it rather than repeated here: a number
// copied into a test drifts from the thing it is testing, and then the test
// fails for a reason that has nothing to do with either implementation.
const CFG = {
  rhythm: JSON.parse(execFileSync("python3", ["-c", `
import sys, json
sys.path.insert(0, ${JSON.stringify(PYTHON_REPO)})
import config
print(json.dumps(config.load()["rhythm"]))
`], { encoding: "utf8" })),
};

let failures = 0;

for (const file of process.argv.slice(2)) {
  const units = extract(readFileSync(file, "utf8"), file);
  const js = measure(units, CFG);
  const py = JSON.parse(execFileSync("python3", ["-c", PY, file], {
    encoding: "utf8",
    maxBuffer: 1 << 24,
  }));

  const rows = js.rows.map((r) => [r.name, r.got, r.want, r.ok]);
  const sameRows = JSON.stringify(rows) === JSON.stringify(py.rows);
  const sameCounts = JSON.stringify(js.counts) === JSON.stringify(py.counts);
  const name = file.split("/").pop();

  console.log(`  ${sameRows && sameCounts ? "same    " : "DIFFERENT"}  ${name}`
    + `  ${js.counts.length} sentences`);

  if (sameRows && sameCounts) continue;
  failures++;

  if (!sameCounts) {
    console.log(`      counts js ${js.counts.length} · py ${py.counts.length}`);
    // The first sentence they disagree on is the one worth reading.
    for (let i = 0; i < Math.max(js.counts.length, py.counts.length); i++) {
      if (js.counts[i] !== py.counts[i]) {
        console.log(`      first differs at ${i}: js ${js.counts[i]} · py ${py.counts[i]}`);
        break;
      }
    }
  }
  for (let i = 0; i < rows.length; i++) {
    if (JSON.stringify(rows[i]) !== JSON.stringify(py.rows[i])) {
      console.log(`      js: ${JSON.stringify(rows[i])}`);
      console.log(`      py: ${JSON.stringify(py.rows[i])}`);
    }
  }
}

console.log(failures ? `\n${failures} differ` : "\nidentical");
process.exit(failures ? 1 : 0);
