/**
 * Write src/detectors/README.md from the comments, so the index cannot drift.
 *
 * A hand-kept list goes stale on the first detector somebody tweaks, and a
 * description that no longer matches its pattern is worse than no description at
 * all, because it is read and believed.
 *
 *   node scripts/detectors-readme.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { DETECTORS } from "../src/detectors/index.js";
import { defaults } from "../src/config.js";
import { byId, fields } from "./fields.mjs";

const DIR = join(import.meta.dirname, "..", "src", "detectors");
const cfg = defaults();
const files = byId(DIR);

const rows = [];
const body = [];

for (const d of DETECTORS) {
  const file = files[d.id];
  const f = fields(readFileSync(join(DIR, file), "utf8"));
  rows.push(`| [\`${d.id}\`](#${d.id}) | ${d.level} | ${d.langs} `
    + `| ${(f.Detects ?? "").split("\n")[0]} |`);

  body.push(`### ${d.id}\n`);
  body.push(`\`${file}\` · **${d.level}** · ${d.langs}`
    + (d.budget ? ` · budget ${d.budget(1000, cfg)} per 1000 words` : "") + "\n");
  for (const k of ["Detects", "Fix"]) {
    if (f[k]) body.push(`**${k}.** ${f[k]}\n`);
  }
  if (f.Before) body.push("```\n" + `before   ${f.Before}\nafter    ${f.After ?? ""}` + "\n```\n");
  for (const k of ["Not this", "Why"]) {
    if (f[k]) body.push(`**${k}.** ${f[k]}\n`);
  }
  if (d.note) body.push(`> printed beside the count: ${d.note}\n`);
  body.push("");
}

const hard = DETECTORS.filter((d) => d.level === "HARD").length;
const out = [
  "<!-- human: specimen -->\n",
  "# detectors\n",
  `${DETECTORS.length} detectors, one to a file. ${hard} that a regex settles alone `
    + `(\`HARD\`) and ${DETECTORS.length - hard} it can only point at (\`REVIEW\`).\n`,
  "Generated from the comments by `scripts/detectors-readme.mjs`. "
    + "Edit the file, not this.\n",
  "| id | level | langs | detects |",
  "| --- | --- | --- | --- |",
  ...rows,
  "",
  "## Adding one\n",
  "Copy the nearest file, keep the comment shape, and add it to the list in "
    + "`index.js`. The list is explicit on purpose: auto-discovery lets a file with a "
    + "typo silently not register, and a pattern that is never checked reads exactly "
    + "like a pattern that found nothing.\n",
  "Then `npm test`, which fails if the id is undocumented, if the detector never "
    + "fires against the fixtures, or if a register watches an id that is not there.\n",
  "---\n",
  ...body,
];

writeFileSync(join(DIR, "README.md"), out.join("\n"), "utf8");
console.log(`  src/detectors/README.md: ${DETECTORS.length} detectors`);
