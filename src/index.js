/**
 * Count the AI tells in one document.
 *
 * The library half: no files, no terminal, no colours. The CLI reads and prints,
 * the browser editor renders, and both call this. Anything that touches a disk
 * belongs to whoever called it, which is what lets the same counting run in a
 * page with no filesystem at all.
 */
import { DETECTORS } from "./detectors/index.js";
import { defaults } from "./config.js";
import * as lang from "./lang.js";
import { measure } from "./rhythm/index.js";
import { extract } from "./units/index.js";

export { DETECTORS, byId } from "./detectors/index.js";
export { CONFIG_NAME, DEFAULTS, defaults, merge } from "./config.js";
export { extract, PROSE, Unit, split } from "./units/index.js";
export { measure } from "./rhythm/index.js";
export { Report } from "./report.js";
export * as lang from "./lang.js";

/**
 * @typedef {object} Finding
 * @property {import("./detectors/base.js").Detector} detector
 * @property {import("./detectors/base.js").Hit[]} hits
 * @property {number} budget
 * @property {boolean} over
 * @property {boolean} skipped true when the detector does not apply to this language
 */

/**
 * @param {string} source
 * @param {string} path used to pick the reader and nothing else
 * @param {object} [options]
 * @param {object} [options.cfg] thresholds; the defaults when absent
 * @param {Set<string>|string[]} [options.ignore] exact sentences never counted
 * @returns {{units, words: number, sentences: number, language: "es"|"en"|null,
 *            findings: Finding[], rhythm: {rows, counts}, failures: number}}
 */
export function check(source, path, { cfg = defaults(), ignore = [] } = {}) {
  const skip = ignore instanceof Set ? ignore : new Set(ignore);
  const units = extract(source, path);
  const words = units.reduce((n, u) => n + u.words(), 0);
  const sentences = units.reduce((n, u) => n + u.sentences().length, 0);
  const language = lang.of(source);

  let failures = 0;
  // Every detector runs even on a file that produced no units, because its zero
  // is an answer: a page of nothing but code fences reports thirty-two zeros,
  // and a page the reader silently skipped reports the same thing. Printing
  // neither makes those two look identical.
  const findings = DETECTORS.map((detector) => {
    // A detector declared for one language says nothing about the other, and
    // running it anyway is where the noise comes from: "y no está en ningún
    // tablero" ends a Spanish sentence and is an echo in English.
    if (!lang.applies(detector.langs, language)) {
      return { detector, hits: [], budget: 0, over: false, skipped: true };
    }
    const hits = detector.find(units, cfg).filter((h) => !skip.has(h.quote));
    const budget = detector.budget ? detector.budget(words, cfg) : 0;
    const over = hits.length > budget;
    if (over && detector.level === "HARD") failures++;
    return { detector, hits, budget, over, skipped: false };
  });

  const rhythm = measure(units, cfg);
  failures += rhythm.rows.filter((r) => !r.ok).length;

  return { units, words, sentences, language, findings, rhythm, failures };
}
