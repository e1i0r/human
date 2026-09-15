/**
 * What both hooks need: what counts as prose, and how to report on it.
 *
 * A hook runs after somebody else's tool call and has one job it must never
 * fail at, which is staying out of the way. Anything that goes wrong here ends
 * as silence, because a checker that breaks a write is a checker that gets
 * uninstalled the same afternoon.
 */
import { readFileSync, statSync } from "node:fs";
import { extname, basename } from "node:path";

import { check } from "../src/index.js";
import { loadConfig } from "../src/find-config.js";
import { Report } from "../src/report.js";
import { declared } from "../src/registers.js";

export const PROSE = new Set([".md", ".markdown", ".html", ".htm", ".txt"]);

// Prose lives in some directories and not others. A README inside a source tree
// is prose; a fixture, a changelog and a lockfile are not, and neither is
// anything under a directory a build writes into.
export const SKIP_PARTS = new Set(["node_modules", "vendor", "dist", "build", ".git",
  "__pycache__", "site-packages", "tests", "test", "fixtures", ".venv"]);
export const SKIP_NAMES = new Set(["CHANGELOG.md", "LICENSE.md", "CODE_OF_CONDUCT.md"]);

/** The hook payload, or null when stdin is not the shape this expects. */
export async function payload() {
  try {
    const chunks = [];
    for await (const c of process.stdin) chunks.push(c);
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

export const toolName = (p) => p?.tool_name ?? p?.toolName ?? "";
export const toolInput = (p) => p?.tool_input ?? p?.toolInput ?? {};

/**
 * Whether this path is prose somebody meant to publish.
 *
 * @param {string} path
 * @param {string[]} [skip] what the project calls its own notes
 */
export function isProse(path, skip = []) {
  if (!PROSE.has(extname(path).toLowerCase())) return false;
  if (SKIP_NAMES.has(basename(path))) return false;
  if (path.split(/[/\\]/).some((part) => SKIP_PARTS.has(part))) return false;
  // A draft nobody has decided to publish is not a draft this should argue with.
  if (skip.some((frag) => path.includes(frag))) return false;
  try {
    return statSync(path).isFile();
  } catch {
    return false;
  }
}

/**
 * Print the brief report for these files, and nothing at all when they are clean.
 *
 * Under budget is the ordinary case and says nothing worth interrupting for.
 * What gets printed is a file that needs a decision, and the counts that say
 * which one.
 */
export function reportOn(paths) {
  const lines = [];
  for (const path of paths) {
    let cfg;
    try {
      cfg = loadConfig(path);
    } catch {
      continue;                        // a broken config is not this file's fault
    }
    const out = new Report(cfg, {
      colour: false,
      brief: true,
      write: (line) => lines.push(line),
      register: declared(cfg),
    });
    let r;
    try {
      r = check(readFileSync(path, "utf8"), path, { cfg });
    } catch {
      continue;
    }
    const before = lines.length;
    out.header(path, r.units.length, r.sentences, r.words);
    for (const level of ["HARD", "REVIEW"]) {
      out.level(level);
      for (const f of r.findings) {
        if (f.detector.level !== level || f.skipped) continue;
        out.detector(f.detector, f.hits, f.budget, f.over);
      }
    }
    if (r.rhythm.rows.length) out.rhythm(r.rhythm.rows, r.rhythm.counts);
    // The header always prints, so a file with nothing under it leaves one line
    // saying a page was counted and found clean. Take it back out.
    if (lines.length - before <= 1) lines.length = before;
  }
  const text = lines.join("\n").trim();
  if (text) console.log(text);
}
