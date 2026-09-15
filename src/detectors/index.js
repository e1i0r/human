/**
 * The detectors, one to a file, listed here on purpose.
 *
 * Auto-discovery was the other option and it fails in the direction that hurts:
 * a file with a typo in it simply never registers, the report comes back with
 * one fewer pattern, and a pattern that is not checked reads exactly like a
 * pattern that found nothing. An import list breaks loudly instead.
 *
 * The order here is the order of the report.
 */
export { HARD, REVIEW, detector, sentenceHits } from "./base.js";

// HARD: a regex settles it alone.
import emDash from "./em-dash.js";
import semicolon from "./semicolon.js";
import curlyQuotes from "./curly-quotes.js";
import bannedVocabulary from "./banned-vocabulary.js";
import negationFraming from "./negation-framing.js";
import aiTransition from "./ai-transition.js";

/** @type {import("./base.js").Detector[]} */
export const DETECTORS = [
  emDash,
  semicolon,
  curlyQuotes,
  bannedVocabulary,
  negationFraming,
  aiTransition,
];

/** @param {string} id */
export function byId(id) {
  const d = DETECTORS.find((x) => x.id === id);
  if (!d) throw new Error(`no detector called ${id}`);
  return d;
}
