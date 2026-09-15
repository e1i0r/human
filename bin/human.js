#!/usr/bin/env node
/**
 * Count the AI tells in a draft. Print the counts. Fail if one is over budget.
 *
 * Nothing here reads a draft looking for patterns. A detector takes one
 * pattern, scans every unit for it, and reports the count, zeros included. What
 * a person judges is only what the report hands them.
 */
import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";

import { check } from "../src/index.js";
import { DEFAULTS } from "../src/config.js";
import { loadConfig } from "../src/find-config.js";
import { Report } from "../src/report.js";
import * as registers from "../src/registers.js";

const USAGE = `
  human FILE [FILE...]        markdown or html
  human FILE --only=REVIEW    only the ones that need judgement
  human FILE --ignore=ok.txt  one exact sentence per line, never counted
  human --config              every threshold with the argument for it
  human --registers           what a piece of writing can be for
  human --register=sales      one of them, in full

  Exit code is the number of budgets exceeded, so this drops into a pre-commit
  hook or a CI job unchanged. That is the whole point of it: whether a draft is
  clean stops being a question its own writer answers.
`;

function showConfig() {
  for (const [section, keys] of Object.entries(DEFAULTS)) {
    console.log(`\n[${section}]`);
    for (const [k, [value, why]] of Object.entries(keys)) {
      console.log(`  ${k.padEnd(20)} ${String(value).padStart(5)}    # ${why}`);
    }
  }
  console.log();
}

const { values: flags, positionals: files } = parseArgs({
  allowPositionals: true,
  allowNegative: true,
  options: {
    only: { type: "string" },
    ignore: { type: "string" },
    brief: { type: "boolean", default: false },
    // Declared as the positive so Node's own --no-x negation applies: a flag
    // named "no-colour" makes --no-colour ambiguous and it silently kept the
    // escape codes, which is the one thing the flag exists to stop.
    colour: { type: "boolean", default: true },
    config: { type: "boolean", default: false },
    registers: { type: "boolean", default: false },
    register: { type: "string" },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (flags.config) {
  showConfig();
  process.exit(0);
}
if (flags.registers || flags.register) {
  registers.show(flags.register);
  process.exit(0);
}
if (flags.help || !files.length) {
  console.log(USAGE);
  process.exit(flags.help ? 0 : 2);
}

const cfg = loadConfig(files[0]);
const ignore = flags.ignore
  ? new Set(readFileSync(flags.ignore, "utf8").split("\n"))
  : new Set();
const out = new Report(cfg, {
  colour: flags.colour && process.stdout.isTTY,
  brief: flags.brief,
  register: registers.declared(cfg),
});

// The exit code counts what the report printed, and nothing it left out. Asking
// for one section and being failed by another is how a writer learns to stop
// passing --only, and then to stop running the thing at all.
let total = 0;
for (const file of files) {
  const result = check(readFileSync(file, "utf8"), file, { cfg, ignore });
  out.header(file, result.units.length, result.sentences, result.words);

  for (const level of ["HARD", "REVIEW"]) {
    if (flags.only && flags.only !== level) continue;
    out.level(level);
    for (const f of result.findings) {
      // A detector the language turned off is not a zero, it is a question
      // nobody asked, and printing it as a zero says the page passed a check
      // that never ran.
      if (f.detector.level !== level || f.skipped) continue;
      out.detector(f.detector, f.hits, f.budget, f.over);
      if (f.over && level === "HARD") total++;
    }
  }
  if ((!flags.only || flags.only === "RHYTHM") && result.rhythm.rows.length) {
    out.rhythm(result.rhythm.rows, result.rhythm.counts);
    total += result.rhythm.rows.filter((r) => !r.ok).length;
  }
}

out.footer(total);
process.exit(total);
