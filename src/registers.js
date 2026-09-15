/**
 * What a piece of writing is for, read before a word of it is written.
 *
 * A register moves nothing in the counting. It says what this text is trying to
 * do, and half of what reads as generated is a word that belongs somewhere else:
 * "enunciar" is right in a thesis, "oferta" is right in sales copy, "palanca" is
 * right in a business deck. None is wrong, and all are wrong somewhere.
 *
 * One file each, so adding one is writing a file rather than editing a list.
 * This is the opposite of how the detectors are registered, and for the opposite
 * reason: a register that fails to load is a piece of advice that did not
 * arrive, which the writer notices, where a detector that fails to load is a
 * count of zero that nobody questions.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { parse } from "./toml.js";

const HERE = join(import.meta.dirname, "..", "registers");

/** @returns {string[]} every register this install carries, sorted */
export function names() {
  return readdirSync(HERE)
    .filter((f) => f.endsWith(".toml"))
    .map((f) => f.slice(0, -5))
    .sort();
}

/**
 * @param {string} name
 * @returns {{name: string, label: string, voice: string, watch?: string[]}}
 */
export function load(name) {
  try {
    return parse(readFileSync(join(HERE, `${name}.toml`), "utf8"));
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
    throw new Error(`no register called "${name}". Known: ${names().join(", ")}`);
  }
}

/**
 * The register a project declared, or null.
 *
 * Wrong beats silent here: a name with a typo in it means the writer believes
 * they are being held to a register nobody loaded.
 */
export function declared(cfg) {
  const name = cfg?.write?.register;
  return name ? load(name) : null;
}

/** Print one register, or the list of them. */
export function show(name, write = console.log) {
  if (name) {
    const r = load(name);
    write(`\n${r.name} — ${r.label}\n`);
    write(`  ${r.voice.trim().replaceAll("\n", "\n  ")}`);
    if (r.watch?.length) write(`\n  watch: ${r.watch.join(", ")}\n`);
    return;
  }
  write("");
  for (const n of names()) write(`  ${n.padEnd(14)} ${load(n).label}`);
  write('\n  Pick one in .human.toml:  [write] register = "sales"\n');
}
