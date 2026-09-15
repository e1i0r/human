/**
 * negation-framing · HARD · es/en
 *
 * Detects
 *   no es X, es Y · no solo · más que X, es Y · it's not X, it's Y · not just.
 *
 * Fix
 *   Say what the thing is. The negated half almost never carries anything.
 *
 * Before   No es una herramienta, es una plataforma.
 * After    Es una plataforma.
 *
 * Not this
 *   A negation with content of its own: "se envuelve y se pasa, o se registra
 *   y se detiene".
 *
 * Why
 *   The pivot manufactures contrast where there is only one claim, and it
 *   survives into poetry and marketing copy wearing a nicer coat.
 */
import { HARD, detector, sentenceHits } from "./base.js";

const NEG = /(\bno\s+(?:es|son|se\s+trata\s+de)\b[^.,;:]{2,50},\s*(?:es|son|sino)\b|\bno\s+s[oó]lo\b|\bm[aá]s\s+que\s+[a-záéíóúñ]+,\s*es\b|\bit'?s\s+not\s+[^.,;:]{2,50},\s*it'?s\b|\bnot\s+just\b|\bisn'?t\s+[^.,;:]{2,50},\s*it'?s\b)/i;

export default detector({
  id: "negation-framing",
  label: "negation framing",
  level: HARD,
  find: (units) => sentenceHits(units, (s) => NEG.test(s)),
});
