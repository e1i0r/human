#!/usr/bin/env node
/**
 * Set the thresholds from prose the author already trusts.
 *
 * Every default is somebody's judgement, mostly borrowed. That is fine as a
 * starting point and wrong as a permanent one: a technical reference repeats its
 * subject nouns more than an essay does, and a writer who never writes a
 * four-word sentence is not going to start because a tool asked.
 *
 * So: run the measurements over a corpus the author calls good, look at where
 * that corpus actually sits, and write a .human.toml that lets it through while
 * still catching what lies outside it.
 *
 *   human-calibrate posts/*.md              see what the corpus does
 *   human-calibrate posts/*.md --write .    write .human.toml there
 *
 * The corpus has to be prose nobody edited with this tool. Calibrating on text
 * these thresholds already shaped measures the thresholds, not the writer.
 *
 * The second mode asks whether each detector is worth having at all:
 *
 *   human-calibrate --human old/ --ai model/
 *
 * old/ is prose written before anybody could generate it, so every hit there
 * is a false alarm. model/ is generated text on the same kind of subject. A
 * detector earns its place when it fires more on the second than on the first;
 * one that fires more on the first is flagging people.
 */
import { parseArgs } from "node:util";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";

import { check } from "../src/index.js";
import { DETECTORS } from "../src/detectors/index.js";
import { CONFIG_NAME } from "../src/config.js";
import { loadConfig } from "../src/find-config.js";
import { measure as rhythm } from "../src/rhythm/index.js";
import { extract } from "../src/units/index.js";

// How far past the corpus a threshold sits. At 0.90 a pattern has to be rarer
// than nine tenths of what this writer does before it is worth printing: the
// tool should be quiet on the writing it was calibrated against, or it stops
// being opened.
const QUANTILE = 0.90;

// Below this a file says nothing: one em dash in eighty words is a rate of
// twelve per thousand, and the corpus is then measuring its own shortest page.
const ENOUGH_WORDS = 200;

function percentile(values, q) {
  if (!values.length) return null;
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.min(Math.floor(q * ordered.length), ordered.length - 1)];
}

function median(values) {
  const ordered = [...values].sort((a, b) => a - b);
  const mid = ordered.length >> 1;
  return ordered.length % 2 ? ordered[mid] : (ordered[mid - 1] + ordered[mid]) / 2;
}

/** Hits per thousand words per detector, and the rhythm of each file. */
function measure(paths, cfg) {
  const rates = Object.fromEntries(DETECTORS.map((d) => [d.id, []]));
  const rhythms = [];
  let files = 0;
  let words = 0;

  for (const path of paths) {
    const units = extract(readFileSync(path, "utf8"), basename(path));
    const n = units.reduce((total, u) => total + u.words(), 0);
    if (n < ENOUGH_WORDS) continue;
    files += 1;
    words += n;
    for (const d of DETECTORS) {
      rates[d.id].push(1000 * d.find(units, cfg).length / n);
    }
    const { rows } = rhythm(units, cfg);
    if (rows.length) rhythms.push(Object.fromEntries(rows.map((r) => [r.name, r.got])));
  }
  return { rates, rhythms, files, words };
}

const pad = (n, width, places = 2) => n.toFixed(places).padStart(width);

function report({ rates, rhythms, files, words }) {
  console.log(`\n${files} files · ${words.toLocaleString("en-US")} words\n`);
  console.log(`  ${"detector".padEnd(26)} ${"median".padStart(7)} `
    + `${"p90".padStart(7)} ${"max".padStart(7)}   per 1000 words`);

  const byRate = Object.entries(rates)
    .sort((a, b) => percentile(b[1], QUANTILE) - percentile(a[1], QUANTILE));
  for (const [id, values] of byRate) {
    const p90 = percentile(values, QUANTILE);
    const flag = p90 > 0 ? "  <- fires on this writer" : "";
    console.log(`  ${id.padEnd(26)} ${pad(median(values), 7)} ${pad(p90, 7)} `
      + `${pad(Math.max(...values), 7)}${flag}`);
  }

  if (!rhythms.length) return;
  console.log(`\n  ${"rhythm".padEnd(26)} ${"median".padStart(7)} `
    + `${"p10".padStart(7)} ${"p90".padStart(7)}`);
  for (const name of Object.keys(rhythms[0])) {
    const values = rhythms.map((r) => r[name]);
    console.log(`  ${name.padEnd(26)} ${pad(median(values), 7, 1)} `
      + `${pad(percentile(values, 0.10), 7, 1)} ${pad(percentile(values, QUANTILE), 7, 1)}`);
  }
}

/**
 * The lines worth putting in a .human.toml, and nothing else.
 *
 * A detector the corpus never trips needs no entry: its default already lets
 * this writer through, and writing it down only pins a number nobody chose.
 */
function suggest({ rates, rhythms }) {
  const out = [];
  const noisy = Object.entries(rates)
    .map(([id, values]) => [id, percentile(values, QUANTILE)])
    .filter(([, p90]) => p90 > 0)
    .sort((a, b) => b[1] - a[1]);

  if (noisy.length) {
    out.push("# Detectors this writer trips regularly. Each line is a",
      "# measurement of their prose, not a rule about writing.");
    for (const [id, p90] of noisy) {
      out.push(`#   ${id}: ${p90.toFixed(2)} hits per 1000 words at p${QUANTILE * 100}`);
    }
  }

  if (rhythms.length) {
    const got = (name) => rhythms.map((r) => r[name]);
    out.push("", "[rhythm]",
      `spread = ${Math.trunc(percentile(got("spread, longest to shortest"), 0.10))}`
        + "      # 10th percentile of this corpus",
      `mid_band = ${Math.trunc(percentile(got("share in the 10-20 band"), QUANTILE))}`
        + "     # 90th percentile",
      `shortest = ${Math.trunc(percentile(got("shortest sentence"), QUANTILE))}`
        + "      # 90th percentile",
      // Median rather than p90: the p90 of any corpus is its worst pages, and a
      // threshold set there only speaks once a draft is past saving.
      `trios = ${Math.trunc(median(got("runs of three within 5")))}`
        + "         # median of this corpus");
  }
  return out.join("\n");
}

const READABLE = new Set([".md", ".markdown", ".html", ".htm"]);

/** Files and directories as given, directories walked for what human can read. */
function expand(paths) {
  const out = [];
  for (const path of paths) {
    if (!statSync(path).isDirectory()) { out.push(path); continue; }
    for (const name of readdirSync(path).sort()) {
      if (name.startsWith(".") || name === "node_modules") continue;
      const full = join(path, name);
      if (statSync(full).isDirectory()) out.push(...expand([full]));
      else if (READABLE.has(extname(name).toLowerCase())) out.push(full);
    }
  }
  return out;
}

// Under this many hits across both sides a ratio is two or three sentences
// talking, and printing a verdict on it reads as a finding.
const ENOUGH_HITS = 10;

/**
 * Hits per 10,000 words for every detector on each side.
 *
 * Words are counted per detector, only in the files whose language it applies
 * to: a Spanish-only detector measured against English pages would look rare
 * on whichever side had more English, and say nothing about the detector.
 */
function rates(paths, cfg) {
  const hits = Object.fromEntries(DETECTORS.map((d) => [d.id, 0]));
  const words = Object.fromEntries(DETECTORS.map((d) => [d.id, 0]));
  let files = 0;
  let total = 0;
  for (const path of paths) {
    const result = check(readFileSync(path, "utf8"), basename(path), { cfg });
    if (result.words < ENOUGH_WORDS) continue;
    files += 1;
    total += result.words;
    for (const f of result.findings) {
      if (f.skipped) continue;
      hits[f.detector.id] += f.hits.length;
      words[f.detector.id] += result.words;
    }
  }
  return { hits, words, files, total };
}

function compare(humanPaths, aiPaths, cfg) {
  const people = rates(humanPaths, cfg);
  const model = rates(aiPaths, cfg);
  console.log(`\n  --human  ${people.files} files · ${people.total.toLocaleString("en-US")} words`);
  console.log(`  --ai     ${model.files} files · ${model.total.toLocaleString("en-US")} words\n`);
  console.log(`  ${"detector".padEnd(26)} ${"human".padStart(7)} ${"ai".padStart(7)} `
    + `${"ratio".padStart(7)}   per 10,000 words`);

  const per = (side, id) => (side.words[id] ? 1e4 * side.hits[id] / side.words[id] : 0);
  const rows = DETECTORS.map((d) => {
    const h = per(people, d.id), a = per(model, d.id);
    // Half a hit on each side keeps a zero from turning into an infinite ratio.
    return { id: d.id, h, a, ratio: (a + 0.5) / (h + 0.5), n: people.hits[d.id] + model.hits[d.id] };
  }).sort((x, y) => y.ratio - x.ratio);

  for (const r of rows) {
    const verdict = r.n === 0 ? "silent on both"
      : r.n < ENOUGH_HITS ? "too few hits to say"
      : r.ratio >= 1.5 ? `useful: fires ${r.ratio.toFixed(1)}x more on ai`
      : r.ratio <= 1 / 1.5 ? "flags people: review"
      : "no real difference";
    console.log(`  ${r.id.padEnd(26)} ${pad(r.h, 7, 1)} ${pad(r.a, 7, 1)} `
      + `${pad(r.ratio, 6, 1)}x   ${verdict}`);
  }
  console.log("\n  Every hit on the --human side is a false alarm only if that prose was"
    + "\n  written before anybody could generate it, and nobody edited it with this tool.\n");
}

const { values: flags, positionals: files } = parseArgs({
  allowPositionals: true,
  options: {
    write: { type: "string" },
    human: { type: "string", multiple: true },
    ai: { type: "string", multiple: true },
  },
});

if (flags.human || flags.ai) {
  if (!flags.human || !flags.ai) {
    console.log("  human-calibrate --human DIR [--human DIR] --ai DIR [--ai DIR]");
    process.exit(2);
  }
  const humanPaths = expand(flags.human);
  compare(humanPaths, expand(flags.ai), loadConfig(humanPaths[0] ?? "."));
  process.exit(0);
}

if (!files.length) {
  console.log("  human-calibrate FILE [FILE...] [--write=DIR]");
  console.log("  human-calibrate --human DIR --ai DIR");
  process.exit(2);
}

const measured = measure(files, loadConfig(files[0]));
if (!measured.files) {
  console.error("nothing long enough to measure");
  process.exit(1);
}
report(measured);

const body = suggest(measured);
console.log(`\n${"-".repeat(62)}\n${body}\n`);

if (flags.write) {
  const target = join(flags.write, CONFIG_NAME);
  const header = `# Calibrated against ${measured.files} files, `
    + `${measured.words.toLocaleString("en-US")} words.\n`
    + "# Regenerate with the calibrator, do not hand-edit the numbers\n"
    + "# without saying why beside them.\n\n";
  writeFileSync(target, `${header}${body}\n`, "utf8");
  console.log(`wrote ${target}`);
}
