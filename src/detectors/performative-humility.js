/**
 * performative-humility · REVIEW · es/en
 *
 * Detects
 *     el límite honesto · para ser justos · hay que reconocer · algunas
 *     salvedades · to be fair · a few caveats.
 *
 * Fix
 *     Fold the caveat that genuinely qualifies a claim into the sentence making
 *     it, and delete the rest.
 *
 * Before
 *     El límite honesto: no lo he probado a escala.
 * After
 *     Lo he corrido hasta 4.000 al día.
 *
 * Not this
 *     Nothing. A section announcing that you are about to be honest was not being
 *     honest.
 *
 * Why
 *     Announcing the virtue replaces demonstrating it, and what follows is
 *     usually a defence against a criticism nobody made.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:el\s+l[ií]mite\s+honesto|para\s+ser\s+justos|hay\s+que\s+reconocer|algunas\s+salvedades|siendo\s+honesto|to\s+be\s+fair|a\s+few\s+caveats|the\s+honest\s+limit)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "performative-humility",
  label: "performative humility",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
