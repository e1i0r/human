/**
 * pattern-announcement · REVIEW · es/en
 *
 * Detects
 *     El patrón es · La regla es · La idea es · El truco está.
 *
 * Fix
 *     Describe it directly, without introducing it.
 *
 * Before
 *     La regla es simple: no toques migraciones.
 * After
 *     Las migraciones no se editan a mano.
 *
 * Not this
 *     A rule quoted verbatim from a document.
 *
 * Why
 *     Naming a pattern before describing it spends a sentence on ceremony.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /^(?:El\s+patr[oó]n\s+es|La\s+regla\s+es|La\s+idea\s+es|El\s+truco\s+est[aá]|Lo\s+que\s+hago\s+es|The\s+pattern\s+is|The\s+rule\s+I\s+use)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "pattern-announcement",
  label: "pattern announcement",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
