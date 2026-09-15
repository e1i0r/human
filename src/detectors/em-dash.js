/**
 * em-dash · HARD · es/en
 *
 * Detects
 *   An em dash or en dash anywhere in a unit.
 *   Budget: one per 300 words. Under 300 words, none.
 *
 * Fix
 *   A period, a comma, parentheses, or cut the aside entirely. Usually the
 *   whole aside was the problem.
 *
 * Before   La tarea corre sola — y deja el registro.
 * After    La tarea corre sola, y deja el registro.
 *
 * Not this
 *   The hyphen in a compound word, or in a numeric range (10-20).
 *
 * Why
 *   The most reliable single tell there is. Models use it at three to five
 *   times the human rate, and it survives rewriting because it still looks
 *   elegant to whoever is doing the rewriting.
 */
import { HARD, detector, sentenceHits } from "./base.js";

export default detector({
  id: "em-dash",
  label: "em dash",
  level: HARD,
  budget: (words, cfg) => Math.floor(words / cfg["em-dash"].per_words),
  find: (units) => sentenceHits(units, (s) => s.includes("—") || s.includes("–")),
});
