/**
 * What every detector is made of.
 *
 * Two levels, and the split is the whole point. HARD is a pattern a regex
 * settles on its own: an em dash is an em dash and no reading changes that.
 * REVIEW is one a regex can only point at, because whether it is a tell depends
 * on what the sentence is doing. Mixed together the real findings sit under a
 * pile of false positives and the report gets opened once.
 *
 * Each detector carries the id the report prints and the SKILL.md section is
 * named after, so a count is a lookup and never a guess about which rule was
 * meant.
 */

export const HARD = "HARD";
export const REVIEW = "REVIEW";

/**
 * @typedef {object} Hit
 * @property {import("../units/unit.js").Unit} unit
 * @property {string} quote
 */

/**
 * @typedef {object} Detector
 * @property {string} id
 * @property {string} label
 * @property {"HARD"|"REVIEW"} level
 * @property {(units: import("../units/unit.js").Unit[], cfg: object) => Hit[]} find
 * @property {string} langs "es", "en", or "es/en"
 * @property {((words: number, cfg: object) => number)|null} budget
 * @property {string} note printed beside a non-zero count
 */

/**
 * @param {object} d
 * @returns {Detector}
 */
export function detector(d) {
  return { langs: "es/en", budget: null, note: "", ...d };
}

/**
 * Every sentence in every unit that the predicate accepts.
 *
 * @param {import("../units/unit.js").Unit[]} units
 * @param {(sentence: string, unit: import("../units/unit.js").Unit) => boolean} pred
 * @returns {Hit[]}
 */
export function sentenceHits(units, pred) {
  const out = [];
  for (const unit of units) {
    for (const quote of unit.sentences()) {
      if (pred(quote, unit)) out.push({ unit, quote });
    }
  }
  return out;
}
