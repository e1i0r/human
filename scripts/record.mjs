/**
 * Write down what the checker currently answers, as the thing to hold it to.
 *
 *   node test/record.mjs
 *
 * Run this only when a change was meant to move a number, and read the diff on
 * expected.json before committing it. A recording taken without looking turns
 * every test green and tests nothing, which is the one way this file can hurt.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { check } from "../src/index.js";
import { parse } from "../src/toml.js";

// Outside test/ on purpose: node --test runs everything in there, and a
// recorder that runs as part of the suite rewrites the answers it is being
// measured against. Every test passes and nothing is being tested.
const HERE = join(dirname(import.meta.dirname), "test");
const FIXTURES = ["fixture-es.md", "fixture-en.md"];

const recorded = {};
for (const name of FIXTURES) {
  const path = join(HERE, "fixtures", name);
  const r = check(readFileSync(path, "utf8"), name);
  recorded[name] = {
    units: r.units.length,
    words: r.words,
    sentences: r.sentences,
    language: r.language,
    failures: r.failures,
    // Line and quote too: a detector that finds the right number of the wrong
    // things passes a count-only check, and that is the bug that took an
    // afternoon when the markdown line numbers were off by eleven.
    findings: r.findings.filter((f) => f.hits.length || f.skipped).map((f) => ({
      id: f.detector.id,
      skipped: f.skipped,
      over: f.over,
      budget: f.budget,
      hits: f.hits.map((h) => [h.unit.line, h.quote]),
    })),
    rhythm: {
      rows: r.rhythm.rows.map((row) => [row.name, row.got, row.want, row.ok]),
      counts: r.rhythm.counts,
    },
  };
}

recorded["calibrated.toml"] = parse(readFileSync(join(HERE, "fixtures/calibrated.toml"), "utf8"));
recorded["register.toml"] = parse(readFileSync(join(HERE, "fixtures/register.toml"), "utf8"));

writeFileSync(join(HERE, "expected.json"), `${JSON.stringify(recorded, null, 1)}\n`, "utf8");
console.log(`  recorded ${FIXTURES.length} fixtures -> test/expected.json`);
