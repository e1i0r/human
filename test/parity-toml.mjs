/**
 * The config reader has to agree with tomllib.
 *
 * Python reads these files with the standard library, so its answer is the one
 * to match. A hand-written reader is exactly the kind of thing that works on
 * every file anyone tried and then reads `trios = 3   # median` as the string
 * "3   # median", which turns a threshold off without a word in the output.
 *
 *   node test/parity-toml.mjs FILE [FILE...]
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import { parse } from "../src/toml.js";

const PY = `
import tomllib, sys, json
print(json.dumps(tomllib.load(open(sys.argv[1], "rb")), sort_keys=True))
`;

let failures = 0;

for (const file of process.argv.slice(2)) {
  const name = file.split("/").slice(-2).join("/");
  let js;
  try {
    js = parse(readFileSync(file, "utf8"));
  } catch (e) {
    console.log(`  THREW     ${name}\n      ${e.message}`);
    failures++;
    continue;
  }
  const py = execFileSync("python3", ["-c", PY, file], { encoding: "utf8" }).trim();

  // Through Python's own dump on both sides, so key order never counts as a
  // difference: what matters is that the two read the same values.
  const mine = execFileSync("python3", ["-c",
    "import sys, json; print(json.dumps(json.load(sys.stdin), sort_keys=True))"],
    { input: JSON.stringify(js), encoding: "utf8" }).trim();

  if (mine === py) {
    console.log(`  same      ${name}`);
    continue;
  }
  failures++;
  console.log(`  DIFFERENT ${name}\n      js ${mine}\n      py ${py}`);
}

console.log(failures ? `\n${failures} differ` : "\nidentical");
process.exit(failures ? 1 : 0);
