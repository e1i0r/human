/**
 * thesis-opener · REVIEW · es/en
 *
 * Detects
 *   A paragraph opening Lo difícil es · La clave es · El problema es · The hard
 *   part.
 *
 * Fix
 *   Start on the concrete case and let the thesis emerge.
 *
 * Before   Lo difícil fue el despliegue.
 * After    En 2019 subí un rate limiter que se cayó a la hora.
 *
 * Not this
 *   A heading, where stating the claim is right.
 *
 * Why
 *   The frame arrives before the thing it frames, so the reader is told how to
 *   read something they have not seen yet.
 */
import { REVIEW, detector } from "./base.js";
import { PROSE } from "../units/unit.js";

const TESIS = /^(?:Lo\s+(?:dif[ií]cil|importante|clave|real|verdaderamente)|La\s+(?:verdad|clave|parte\s+dif[ií]cil)|El\s+(?:problema|punto|reto)\s+(?:es|est[aá])|The\s+(?:hard|real|tricky)\s+part|The\s+real\s+question)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "thesis-opener",
  label: "thesis-first opener",
  level: REVIEW,
  find: (units) => {
    const out = [];
    for (const unit of units) {
      if (!PROSE.has(unit.kind)) continue;
      const first = unit.sentences()[0];
      if (first && TESIS.test(first)) out.push({ unit, quote: first });
    }
    return out;
  },
});
