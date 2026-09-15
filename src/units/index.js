/**
 * Cut a document into the pieces a reader reads.
 *
 * Everything downstream works on units, so a wrong cut is a wrong report with
 * no sign anything went wrong: a heading swallowed into the paragraph above it
 * is simply never checked as a heading.
 */
import * as html from "./html.js";
import * as markdown from "./markdown.js";

export { Unit, PROSE } from "./unit.js";
export { split } from "./sentences.js";

/**
 * A file that documents the patterns contains the patterns. Marking it says so
 * once, instead of every reader of the report wondering whether the catalogue
 * is broken or the prose is.
 *
 * The old spelling is still read, the way the old config filename is: the files
 * carrying it were marked before the tool was renamed, and a marker that stops
 * being recognised turns a catalogue into thirty-two findings overnight.
 */
export const SPECIMEN = "<!-- human: specimen -->";
const SPECIMENS = [SPECIMEN, "<!-- tells: specimen -->"];

const READERS = {
  ".md": markdown.read,
  ".markdown": markdown.read,
  ".txt": markdown.read,
  ".html": html.read,
  ".htm": html.read,
};

/**
 * @param {string} src
 * @param {string} path used only to pick the reader
 * @returns {import("./unit.js").Unit[]}
 */
export function extract(src, path) {
  if (SPECIMENS.some((m) => src.includes(m))) return [];
  const ext = path.includes(".") ? `.${path.split(".").pop().toLowerCase()}` : ".md";
  return (READERS[ext] ?? markdown.read)(src);
}
