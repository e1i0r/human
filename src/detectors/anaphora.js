/**
 * anaphora · REVIEW · es/en
 *
 * Detects
 *   Two consecutive sentences opening the same way. One shared word is enough
 *   when it carries weight ("Nadie mira. Nadie revisa."); with a determiner it
 *   takes two.
 *
 * Fix
 *   Vary the second opener, or join them into one sentence.
 *
 * Before   Activa entra. Pausada la frenaste. Apagada decidiste que no.
 * After    Solo la activa entra al prompt. La pausada la frenaste tú, y la
 *          apagada se queda sin decirse.
 *
 * Not this
 *   A table or a list, where the parallel is the structure.
 *
 * Why
 *   It reads as cadence rather than argument, and three in a row is a signature.
 */
import { REVIEW, detector } from "./base.js";

const WEAK = new Set([
  "el", "la", "los", "las", "un", "una", "y", "o", "de", "en", "que", "a",
  "the", "an", "and", "or", "of", "in", "to", "it", "is",
]);

const words = (s) => s.toLowerCase().split(/\s+/).filter(Boolean);

export default detector({
  id: "anaphora",
  label: "anaphora",
  level: REVIEW,
  find: (units) => {
    const out = [];
    for (const unit of units) {
      const ss = unit.sentences();
      for (let i = 0; i + 1 < ss.length; i++) {
        const a = words(ss[i]);
        const b = words(ss[i + 1]);
        if (a.length < 2 || b.length < 2) continue;
        const sharedFirst = a[0] === b[0] && !WEAK.has(a[0]) && a[0].length >= 3;
        const sharedTwo = a[0] === b[0] && a[1] === b[1];
        if (sharedFirst || sharedTwo) {
          out.push({ unit, quote: `${ss[i]}  ||  ${ss[i + 1]}` });
        }
      }
    }
    return out;
  },
});
