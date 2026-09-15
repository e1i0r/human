/**
 * curly-quotes · HARD · es/en
 *
 * Detects
 *   Any curly quote or apostrophe in a unit. Budget: none.
 *
 * Fix
 *   Find and replace with straight quotes before shipping.
 *
 * Before   Dijo “hola”.
 * After    Dijo "hola".
 *
 * Not this
 *   Nothing. Unless the house style is typographic quotes, in which case turn
 *   this one off for that project.
 *
 * Why
 *   A single character that gives it away and survives any amount of rewriting,
 *   because nobody reaches for it while typing.
 */
import { HARD, detector, sentenceHits } from "./base.js";

export const CURLY = "‘’“”";

export default detector({
  id: "curly-quotes",
  label: "curly quotes",
  level: HARD,
  find: (units) => sentenceHits(units, (s) => [...CURLY].some((c) => s.includes(c))),
});
