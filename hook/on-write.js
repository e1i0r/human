#!/usr/bin/env node
/**
 * Run the checker after Claude Code writes prose, whether it asked to or not.
 *
 * This exists because the skill could not make anybody follow it. Over one long
 * session the counts were skipped before showing a draft, skipped again after
 * fixing what they found, and once a detector was written and its own finding
 * left in the page. None of that was disagreement: the step is easy to intend
 * and easy to not do, and a rule that depends on remembering has no teeth.
 *
 * A hook does not depend on remembering. Claude Code runs this after every
 * write, the report lands in the model's context, and the numbers are there
 * before the next sentence is written.
 *
 * Prints nothing unless the file is prose this is meant to check: a hook that
 * talks after every edit is a hook somebody turns off.
 */
import { loadConfig } from "../src/find-config.js";
import { isProse, payload, reportOn, toolInput, toolName } from "./common.js";

const WATCHED = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);

const p = await payload();
if (!p || !WATCHED.has(toolName(p))) process.exit(0);

const args = toolInput(p);
const path = args.file_path ?? args.filePath ?? args.notebook_path;
if (!path) process.exit(0);

let skip = [];
try {
  skip = loadConfig(path).skip.paths;
} catch {
  process.exit(0);
}
if (!isProse(path, skip)) process.exit(0);

reportOn([path]);
