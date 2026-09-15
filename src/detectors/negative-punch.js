/**
 * negative-punch · REVIEW · es/en
 *
 * Detects
 *   A short sentence that opens or closes a paragraph and says what something
 *   does not do: "Tampoco lee.", "Un hook no.", "Nada de esto sale del
 *   navegador."
 *
 * Fix
 *   Say what the thing does. "Cuenta, pero lee no" becomes "Cuenta patrones".
 *   "Nada de esto sale del navegador" becomes "Todo se queda en tu navegador".
 *
 * Before   Tampoco lee. Nunca te agarra un número que contradice a otro.
 * After    Cuenta, y por eso un número que contradice a otro se le pasa entero.
 *
 * Not this
 *   A negation that carries the fact itself, where the positive version would
 *   say something else: "El sexto no se arregla solo." Nor a long sentence,
 *   which is doing work rather than landing a beat.
 *
 * Why
 *   Defining a thing by its absence sounds precise and costs the reader an
 *   extra step: they build the positive claim themselves. Generated prose
 *   reaches for it at the two positions where a paragraph wants force, the
 *   first sentence and the last, and a page picks up a dozen of them without
 *   the writer noticing. Count them and the habit shows.
 */
import { REVIEW, detector } from "./base.js";

// The word that opens the sentence, which is where both languages put the
// negation when the whole sentence is the negation.
const OPENER = new RegExp(
  "^[¿¡\"'(]*(?:"
  + "no|ni|nunca|jam[aá]s|nada|nadie|ning[uú]n|ninguna|ninguno|tampoco|sin"
  + "|not|never|nothing|nobody|none|neither|nor|without"
  + ")\\b", "iu");

// "Un hook no." and "Leer, no." put the negation last and drop the verb.
const TRAILING = /\b(?:no|not|nunca|never|tampoco|neither)\s*[.!?]*$/iu;

const count = (s) => s.split(/\s+/).filter(Boolean).length;

export default detector({
  id: "negative-punch",
  label: "negative punch",
  level: REVIEW,
  note: "a negation carrying the fact itself is not this",
  find: (units, cfg) => {
    const c = cfg["negative-punch"];
    const out = [];
    for (const unit of units) {
      const ss = unit.sentences();
      if (ss.length < 2) continue;
      for (const quote of [ss[0], ss[ss.length - 1]]) {
        const n = count(quote);
        if (n < c.min_words || n > c.max_words) continue;
        if (OPENER.test(quote) || TRAILING.test(quote)) out.push({ unit, quote });
      }
    }
    return out;
  },
});
