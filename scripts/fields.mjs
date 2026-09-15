/**
 * Read the labelled blocks out of a detector's comment.
 *
 * Two shapes are in the files, because the first six were written by hand and
 * the other twenty-six were generated. A label can sit alone on its line with
 * the text indented under it, or carry its text on the same line. Both are
 * readable and picking one would mean rewriting thirty-two comments to no end,
 * so this takes either.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export const FIELDS = ["Detects", "Fix", "Before", "After", "Not this", "Why"];
const LABEL = new RegExp(`^(${FIELDS.join("|")})\\b[ \\t]*(.*)$`);

/** @param {string} source the whole .js file */
export function fields(source) {
  const end = source.indexOf("*/");
  if (!source.startsWith("/**") || end < 0) return {};
  const lines = source.slice(3, end).split("\n").map((l) => l.replace(/^\s*\* ?/, ""));

  const out = {};
  let key = null;
  let buffer = [];
  for (const line of lines.slice(1)) {
    const m = LABEL.exec(line.trim());
    if (m) {
      if (key) out[key] = buffer.join("\n").trim();
      key = m[1];
      buffer = m[2] ? [m[2]] : [];
    } else if (key) {
      buffer.push(line.trim());
    }
  }
  if (key) out[key] = buffer.join("\n").trim();
  return out;
}

/** id -> filename, read from the files rather than guessed from their names. */
export function byId(dir) {
  const out = {};
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".js") || name === "index.js" || name === "base.js") continue;
    // Anchored, because "said:" ends in "id:" and one comment quotes a sentence
    // that contains one.
    const id = /^\s*id:\s*"([^"]+)"/m.exec(readFileSync(join(dir, name), "utf8"))?.[1];
    if (id) out[id] = name;
  }
  return out;
}
