/**
 * aphorism-closer · REVIEW · es/en
 *
 * Detects
 *   The last sentence of a unit over 20 words, itself between 4 and 10 words.
 *
 * Fix
 *   Cut it, or fold it into the sentence before.
 *
 * Before   Un gate que pasa no se anota. Se guarda la fricción.
 * After    Un gate que pasa ni se anota. Orbit solo escribe lo que estorbó.
 *
 * Not this
 *   A paragraph ending on its last fact. The test: if the sentence can be
 *   lifted out and quoted alone, it is this.
 *
 * Why
 *   The strongest habit in generated prose and the one an edit pass most often
 *   introduces: a paragraph feels unfinished without a bow, so one gets
 *   appended. Re-check the last sentence of every paragraph on every pass.
 */
import { REVIEW, detector } from "./base.js";

export default detector({
  id: "aphorism-closer",
  label: "aphorism closer",
  level: REVIEW,
  note: "a paragraph may end on its last fact",
  find: (units, cfg) => {
    const c = cfg["aphorism-closer"];
    const out = [];
    for (const unit of units) {
      const ss = unit.sentences();
      if (ss.length < 2 || unit.words() <= c.min_unit_words) continue;
      const last = ss[ss.length - 1];
      const n = last.split(/\s+/).filter(Boolean).length;
      if (n >= c.low && n <= c.high) out.push({ unit, quote: last });
    }
    return out;
  },
});
