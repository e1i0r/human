/**
 * nominalized-particle · REVIEW · es
 *
 * Detects
 *     A possessive turning "sí" or "no" into a noun: "esperando tu sí",
 *     "un correo con su no", "espera mi no".
 *
 * Fix
 *     Say the thing being waited for. Approval, permission, an answer, a refusal.
 *
 * Before
 *     Queda esperando tu sí.
 * After
 *     Queda esperando tu aprobación.
 *
 * Not this
 *     "dar el sí" and "un sí o un no", which are ordinary Spanish, or a "tu no"
 *     that is a negated verb: "tu no sabe nada".
 *
 * Why
 *     Compression a writer reaches for and a speaker does not. It reads as
 *     composed rather than said, and it costs the sentence its concrete noun: the
 *     reader has to work out whether what is being waited for is approval,
 *     permission or a decision. Across 6,871 sentences of one author it appeared
 *     zero times, which is the shape a useful detector has.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:tu|su|mi|nuestro|vuestro)\s+(?:s[ií]|no)(?![\p{L}\p{M}\p{N}_])(?!\s+(?:es|era|fue|ser[aá]|sabe|quiere|puede|tiene|hace|va|est[aá]|debe|suele|deja|llega|viene|sale))/iu;

export default detector({
  id: "nominalized-particle",
  label: "nominalized particle",
  level: REVIEW,
  langs: "es",
  note: "dar el si and un si o un no are ordinary Spanish",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
