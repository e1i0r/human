#!/usr/bin/env node
/**
 * Add the hooks to Claude Code's settings, or take them out again.
 *
 *   node hook/install.js            add them, asking first
 *   node hook/install.js --yes      add them without asking
 *   node hook/install.js --remove   take them out
 *
 * Merges rather than writes: everything already in settings.json stays, this
 * adds two entries under hooks.PostToolUse and leaves the rest alone. Run it
 * twice and nothing happens the second time.
 *
 * A tool that edits a global config on install is a tool people are right to
 * distrust, so it says what it changed, it is one command to undo, and the file
 * is copied next to itself the first time it is touched.
 */
import { chmodSync, copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

const SETTINGS = join(homedir(), ".claude", "settings.json");
const HERE = import.meta.dirname;

// Two after the fact, because one is not enough. on-write covers Write and
// Edit, which is how most sessions change a file. on-bash covers the rest: a
// heredoc rewriting a page is a Bash call as far as the harness knows, and on
// the session this was built in every edit went that way, so the write hook
// would never have fired.
const AFTER = [
  ["Write|Edit|MultiEdit|NotebookEdit", join(HERE, "on-write.js")],
  ["Bash", join(HERE, "on-bash.js")],
];

// And one before, because a register only works before. Counting a page and
// telling it what it was for are opposite ends of the same job.
const BEFORE = [
  ["Write|Edit|MultiEdit|NotebookEdit", join(HERE, "on-prose.js")],
];

/**
 * The file itself, run through its own shebang.
 *
 * Not process.execPath: on this machine that is the brew cellar path with the
 * version number in it, so the hook stops working the day node is upgraded and
 * the only sign is that the reports quietly stop arriving. env node resolves at
 * run time.
 */
const entries = (hooks) => hooks.map(([matcher, file]) => {
  chmodSync(file, 0o755);
  return { matcher, hooks: [{ type: "command", command: file }] };
});

const mine = (group) => (group.hooks ?? []).some((h) =>
  /on-write\.js|on-bash\.js|on-prose\.js|on_write\.py|on_bash\.py/.test(h.command ?? ""));

function load() {
  if (!existsSync(SETTINGS)) return {};
  try {
    return JSON.parse(readFileSync(SETTINGS, "utf8"));
  } catch (e) {
    throw new Error(`${SETTINGS} is not valid JSON, so nothing was touched: ${e.message}`);
  }
}

function save(data) {
  mkdirSync(dirname(SETTINGS), { recursive: true });
  const backup = `${SETTINGS}.before-human`;
  if (existsSync(SETTINGS) && !existsSync(backup)) {
    copyFileSync(SETTINGS, backup);
    console.log(`  backed up to ${backup}`);
  }
  writeFileSync(SETTINGS, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function add(ask) {
  const data = load();
  data.hooks ??= {};
  data.hooks.PostToolUse ??= [];
  data.hooks.PreToolUse ??= [];
  if (data.hooks.PostToolUse.some(mine) || data.hooks.PreToolUse.some(mine)) {
    console.log("  already installed");
    return 0;
  }

  console.log(`\n  This adds three hooks to ${SETTINGS}:\n`);
  console.log("    before a Write or an Edit to prose, hand over the register");
  console.log("    the project declared, so the drafting knows what it is for");
  console.log("    after a Write or an Edit, run the checker on that file");
  console.log("    after a shell command, run it on the prose the tree changed");
  console.log("    and print what they found, if anything.\n");
  console.log("  Only markdown, html and plain text. Nothing else is touched.");
  console.log("  Undo with: node hook/install.js --remove\n");

  if (ask) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = (await rl.question("  Add it? [y/N] ")).trim().toLowerCase();
    rl.close();
    if (answer !== "y" && answer !== "yes") {
      console.log("  left alone");
      return 1;
    }
  }

  data.hooks.PreToolUse.push(...entries(BEFORE));
  data.hooks.PostToolUse.push(...entries(AFTER));
  save(data);
  console.log("  installed, all three. New sessions pick them up.");
  return 0;
}

function remove() {
  const data = load();
  let dropped = 0;
  for (const event of ["PreToolUse", "PostToolUse"]) {
    const groups = data.hooks?.[event] ?? [];
    const kept = groups.filter((g) => !mine(g));
    dropped += groups.length - kept.length;
    if (!groups.length) continue;
    if (kept.length) data.hooks[event] = kept;
    else delete data.hooks[event];
  }
  if (!dropped) {
    console.log("  not installed");
    return 0;
  }
  if (data.hooks && !Object.keys(data.hooks).length) delete data.hooks;
  save(data);
  console.log("  removed");
  return 0;
}

const args = process.argv.slice(2);
process.exit(args.includes("--remove") ? remove() : await add(!args.includes("--yes")));
