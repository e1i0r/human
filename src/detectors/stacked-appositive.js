/**
 * stacked-appositive · REVIEW · es/en
 *
 * Detects
 *     A clause ending in two comma-flanked add-ons, the first usually one punchy
 *     word.
 *
 * Fix
 *     Keep one, and make it the concrete one.
 *
 * Before
 *     explica por qué, en palabras, en tu idioma
 * After
 *     explica por qué, en tu idioma
 *
 * Not this
 *     A single aside, which is ordinary punctuation.
 *
 * Why
 *     Cadence, not content: the short one is an intensifier standing in for a
 *     measurement, and the second repeats it.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /,\s+[a-záéíóúñ]{3,12},\s+[a-z][^,.]{3,45}\.$/u;

export default detector({
  id: "stacked-appositive",
  label: "stacked appositives",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
