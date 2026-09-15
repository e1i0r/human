#!/usr/bin/env node
/**
 * Put the register in front of the writer, before the writing.
 *
 * The other two hooks count what was already written. A register is the other
 * half and it only works the other way round: it says what this page is for, and
 * knowing that after the draft exists is knowing it too late. Half of what reads
 * as generated is a word that belongs to a different kind of writing, and no
 * count catches that, because the word is correct.
 *
 * So this runs before the write, finds the register the project declared, and
 * hands over its voice as context. Once per session per register: a paragraph
 * repeated after every edit is a paragraph that stops being read.
 */
import { mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { loadConfig } from "../src/find-config.js";
import { declared } from "../src/registers.js";
import { isProse, payload, toolInput, toolName } from "./common.js";

const WATCHED = new Set(["Write", "Edit", "MultiEdit", "NotebookEdit"]);
const STATE = join(tmpdir(), "human-hook");
const A_DAY = 24 * 60 * 60 * 1000;

/**
 * True the first time this session asks about this register.
 *
 * A file rather than anything cleverer: the hook is a new process every time, so
 * there is nothing in memory to remember with.
 */
function first(sessionId, register) {
  const key = createHash("sha256").update(`${sessionId}:${register}`).digest("hex").slice(0, 16);
  const marker = join(STATE, key);
  try {
    mkdirSync(STATE, { recursive: true });
    // Leftovers from sessions that ended days ago, swept whenever we are here
    // anyway, so the directory does not grow without bound.
    for (const name of readdirSync(STATE)) {
      const path = join(STATE, name);
      if (Date.now() - statSync(path).mtimeMs > A_DAY) unlinkSync(path);
    }
    writeFileSync(marker, register, { flag: "wx" });
    return true;
  } catch {
    return false;                     // already there, or nowhere to write it
  }
}

const p = await payload();
if (!p || !WATCHED.has(toolName(p))) process.exit(0);

const args = toolInput(p);
const path = args.file_path ?? args.filePath ?? args.notebook_path;
if (!path) process.exit(0);

let register;
try {
  const cfg = loadConfig(path);
  // isProse wants the file to exist, and a Write that creates one is exactly
  // when this is worth saying, so only the shape of the path is asked about.
  if (!isProse(path, cfg.skip.paths) && !/\.(md|markdown|html?|txt)$/i.test(path)) {
    process.exit(0);
  }
  register = declared(cfg);
} catch {
  process.exit(0);
}
if (!register || !first(p.session_id ?? p.sessionId ?? "one", register.name)) process.exit(0);

const watch = register.watch?.length
  ? `\n\nPatterns that cost more in this register than elsewhere: ${register.watch.join(", ")}.`
  : "";

console.log(JSON.stringify({
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    additionalContext: `This project writes as "${register.name}": ${register.label}.\n\n`
      + `${register.voice.trim()}${watch}`,
  },
}));
