/**
 * The JS and the Python have to cut a document the same way, unit for unit.
 *
 * Two implementations drift the day one of them gets a fix the other does not,
 * and the browser editor is the half nobody runs against a corpus, so it is the
 * half that goes quietly wrong. This compares them file by file: kind, line and
 * text, in order, with no allowance for a near match.
 *
 *   node test/parity-units.mjs FILE [FILE...]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { extract } from "../src/units/index.js";

const PYTHON_REPO = process.env.TELLS_CORE
  ?? `${process.env.HOME}/Mi/jobs/personal/repos/tells`;

const PY = `
import sys, json
sys.path.insert(0, ${JSON.stringify(PYTHON_REPO)})
import units
src = open(sys.argv[1], encoding="utf-8").read()
print(json.dumps([[u.kind, u.line, u.text] for u in units.extract(src, sys.argv[1])]))
`;

function fromPython(file) {
  return JSON.parse(execFileSync("python3", ["-c", PY, file], {
    encoding: "utf8",
    maxBuffer: 1 << 24,
  }));
}

let failures = 0;

for (const file of process.argv.slice(2)) {
  const js = extract(readFileSync(file, "utf8"), file)
    .map((u) => [u.kind, u.line, u.text]);
  const py = fromPython(file);
  const same = JSON.stringify(js) === JSON.stringify(py);
  const name = file.split("/").pop();

  console.log(`  ${same ? "same    " : "DIFFERENT"}  ${name}  js ${js.length} · py ${py.length}`);
  if (same) continue;

  failures++;
  // The first difference is the one worth reading; the rest are its shadow.
  for (let i = 0; i < Math.max(js.length, py.length); i++) {
    if (JSON.stringify(js[i]) !== JSON.stringify(py[i])) {
      console.log(`      js: ${JSON.stringify(js[i])?.slice(0, 100)}`);
      console.log(`      py: ${JSON.stringify(py[i])?.slice(0, 100)}`);
      break;
    }
  }
}

console.log(failures ? `\n${failures} differ` : "\nidentical");
process.exit(failures ? 1 : 0);
