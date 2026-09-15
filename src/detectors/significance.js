/**
 * significance · REVIEW · es/en
 *
 * Detects
 *     es la definición de · es el corazón de · es la clave · ahí está la magia ·
 *     stands as a testament.
 *
 * Fix
 *     A plain functional lead-in, and let the reader judge.
 *
 * Before
 *     make check, que es la definición de terminado.
 * After
 *     Todos se corren con make check.
 *
 * Not this
 *     A direct quotation of somebody else saying it.
 *
 * Why
 *     The label tells the reader how to rate the thing instead of letting the
 *     thing land, and it reads as ceremony the artifact never asked for.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:es\s+la\s+definici[oó]n\s+de|es\s+el\s+coraz[oó]n|es\s+la\s+clave|ah[ií]\s+est[aá]\s+la\s+magia|is\s+the\s+definition\s+of|is\s+the\s+heart\s+of|stands\s+as\s+a\s+testament|marks\s+a\s+pivotal)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "significance",
  label: "significance pronouncement",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
