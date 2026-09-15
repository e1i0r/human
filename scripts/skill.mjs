/**
 * Write SKILL.md: the prose from SKILL.head.md, the detectors from the code.
 *
 *   node scripts/skill.mjs
 *
 * The version this was ported from kept a second copy of all thirty-two,
 * translated, so the same pattern was described in two documents in two
 * languages and either could go stale without the other noticing. There is one
 * source now, rendered twice: here for whoever is fixing a draft, and in
 * src/detectors/README.md for whoever is reading the catalogue.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DETECTORS } from "../src/detectors/index.js";
import { defaults } from "../src/config.js";
import { byId, fields } from "./fields.mjs";

const ROOT = join(import.meta.dirname, "..");
const DIR = join(ROOT, "src", "detectors");
const cfg = defaults();
const files = byId(DIR);

const flat = (text) => text.replace(/\s+/g, " ").trim();

const out = [readFileSync(join(ROOT, "SKILL.head.md"), "utf8").trimEnd(), ""];

for (const level of ["HARD", "REVIEW"]) {
  out.push(`## ${level}\n`);
  for (const d of DETECTORS.filter((x) => x.level === level)) {
    const f = fields(readFileSync(join(DIR, files[d.id]), "utf8"));
    out.push(`### ${d.id}\n`);
    // Only where the comment does not already say it: six of them spell the
    // budget out in their own words, and printing both reads like two rules.
    const budget = d.budget && !/budget/i.test(f.Detects ?? "")
      ? ` Budget ${d.budget(1000, cfg)} per 1000 words.`
      : "";
    out.push(`**Detects.** ${flat(f.Detects)}${budget}`);
    out.push(`**Fix.** ${flat(f.Fix)}`);
    if (f.Before) out.push(`**Before → after.** \`${flat(f.Before)}\` → \`${flat(f.After ?? "")}\``);
    if (f["Not this"]) out.push(`**Not this.** ${flat(f["Not this"])}`);
    out.push("");
  }
  out.push("---\n");
}

writeFileSync(join(ROOT, "SKILL.md"), `${out.join("\n").trimEnd()}\n`, "utf8");
console.log(`  SKILL.md: ${DETECTORS.length} detectors`);
