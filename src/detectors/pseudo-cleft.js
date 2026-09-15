/**
 * pseudo-cleft · REVIEW · es/en
 *
 * Detects
 *     A sentence opening Lo que ... es · La que ... es · What ... is.
 *
 * Fix
 *     Put the subject first and open on the concrete case.
 *
 * Before
 *     Lo que se guarda es la fricción.
 * After
 *     Orbit solo escribe lo que estorbó.
 *
 * Not this
 *     A definition that was asked for, or a name: "Lo que Orbit sabe" as a screen title.
 *
 * Why
 *     Glossary syntax. The subject sits behind a relative clause so a term can
 *     arrive like a reveal, and the section slips into explainer mode instead of
 *     saying something.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /^(?:Lo\s+que|La\s+que|El\s+que|Lo\s+[uú]nico\s+que|What)(?![\p{L}\p{M}\p{N}_])[^.]{5,70}?(?<![\p{L}\p{M}\p{N}_])(?:es|son|is|are)(?![\p{L}\p{M}\p{N}_])/u;

export default detector({
  id: "pseudo-cleft",
  label: "pseudo-cleft",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
