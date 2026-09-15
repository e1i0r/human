/**
 * turns-out · REVIEW · es/en
 *
 * Detects
 *     resulta que · lo curioso es · turns out.
 *
 * Fix
 *     State the finding directly.
 *
 * Before
 *     Resulta que la causa era otra.
 * After
 *     La causa era el índice, no la consulta.
 *
 * Not this
 *     "resultar" as an ordinary verb: "el gate resulta en error".
 *
 * Why
 *     Reveal-narrative framing laid over a plain fact.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:resulta\s+que|lo\s+curioso\s+es|lo\s+interesante\s+es|turns\s+out|it\s+turns\s+out)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "turns-out",
  label: "turns-out pivot",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
