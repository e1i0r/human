#!/usr/bin/env node
/**
 * Run the checker after a shell command touched prose.
 *
 * The other hook watches Write and Edit, which covers how most sessions edit a
 * file. It does not cover a heredoc: `python3 - <<EOF` rewriting a page is a
 * Bash call as far as the harness is concerned, and the file lands with nothing
 * watching. On the session this was built in, every edit to a landing page went
 * that way, so the hook that was supposed to give the skill teeth would never
 * once have fired.
 *
 * So this asks git instead of the tool call: what prose did the working tree
 * change, and does it still fail. Nothing to say when the answer is no.
 */
import { execFileSync } from "node:child_process";
import { join } from "node:path";

import { loadConfig } from "../src/find-config.js";
import { isProse, payload, reportOn, toolName } from "./common.js";

const MOST = 3;          // files reported at once; past this the command was a build

function git(args, cwd) {
  try {
    return execFileSync("git", args, {
      cwd, encoding: "utf8", timeout: 15_000, stdio: ["ignore", "pipe", "ignore"],
    });
  } catch {
    return "";
  }
}

/** Prose the working tree has changed and not committed. */
function changed(cwd) {
  const root = git(["rev-parse", "--show-toplevel"], cwd).trim();
  if (!root) return [];

  const out = [];
  for (const line of git(["status", "--porcelain", "-uall"], cwd).split("\n")) {
    if (!line.trim()) continue;
    let name = line.slice(3).trim().replace(/^"|"$/g, "");
    if (name.includes(" -> ")) name = name.split(" -> ").pop();  // a rename
    const path = join(root, name);
    let skip = [];
    try {
      skip = loadConfig(path).skip.paths;
    } catch {
      continue;
    }
    if (isProse(path, skip)) out.push(path);
  }
  return out;
}

const p = await payload();
if (!p || toolName(p) !== "Bash") process.exit(0);

const files = changed(p.cwd ?? process.cwd());
// A command that leaves four pages changed was a build, not a piece of writing,
// and a report on all of them is noise nobody reads.
if (!files.length || files.length > MOST) process.exit(0);

reportOn(files);
