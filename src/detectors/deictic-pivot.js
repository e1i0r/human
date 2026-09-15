/**
 * deictic-pivot · REVIEW · es/en
 *
 * Detects
 *     A sentence of eight words or fewer opening on Eso · Esto · Ahí · Y ahí ·
 *     Así es.
 *
 * Fix
 *     Cut it and let the next sentence carry the weight, or fold it into the one
 *     before.
 *
 * Before
 *     Ahí un modelo ayuda.
 * After
 *     (gone)
 *
 * Not this
 *     An "Eso" that really points at something just named and the sentence
 *     continues from it.
 *
 * Why
 *     A drumbeat the prose did not earn: it delivers a tidy verdict on what was
 *     just said, or ushers in the next subject, and adds nothing either way.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /^(?:Eso|Esto|Ah[ií]|Y\s+ah[ií]|As[ií]\s+es|Y\s+ya|Y\s+listo|That'?s\s+(?:where|the)|This\s+is\s+where|And\s+there)(?![\p{L}\p{M}\p{N}_])/u;

export default detector({
  id: "deictic-pivot",
  label: "deictic pivot",
  level: REVIEW,
  langs: "es/en",
  find: (units, cfg) => sentenceHits(units, (s) => s.split(/\s+/).filter(Boolean).length <= cfg["deictic-pivot"].max_words
    && PATTERN.test(s)),
});
