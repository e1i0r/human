/**
 * negated-echo · REVIEW · es/en
 *
 * Detects
 *   A sentence that lands, then hangs a short negative clause off the end which
 *   echoes what it just said: "y esta vez no vino" after "qué suele venir".
 *
 * Fix
 *   End on the landing. If the negative half carries a fact, give it its own
 *   sentence and its own subject.
 *
 * Before   te dice qué suele venir junto con estos archivos y esta vez no vino
 * After    te dice qué viene junto con estos archivos. Esta vez el test no vino.
 *
 * Not this
 *   A negation that carries new information rather than mirroring the clause
 *   before it. Nor "decidió no hacer", where the infinitive is the object.
 *
 * Why
 *   The mirrored negative is cadence, not content: the sentence had finished
 *   and the tail exists to close it with a beat. It survives editing because
 *   the symmetry reads as precision.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

// Spanish puts the negation before the verb ("y esta vez no vino"); English
// puts it at the end ("and this time it did not"), so the word being negated
// can be missing altogether.
const TAIL = /,?\s+(?:y|e|and)\s+(?:[^,.]{0,30}\s)?(?:(?:no|nunca|jam[aá]s|not|never)\s+([^\s,.]+)(?:[^,.]{0,24})|(?:did|does|was|is|wo|could|would)\s?n[o']t|not)[.!?]?$/i;

// "y no con la regla" is a contrast carrying its own half, not an echo: what
// follows the negation is a preposition or a determiner, never the verb again.
const NOT_A_VERB = /^(?:con|de|del|en|a|al|por|para|sin|sobre|entre|hacia|hasta|el|la|los|las|un|una|lo|su|tu|mi|esa|ese|esta|este|with|of|in|to|for|from|the|an)$/i;

// "decidió no hacer" is what somebody decided, and the infinitive is its object.
const INFINITIVE = /\p{L}+(?:ar|er|ir)$/iu;

const count = (s) => s.split(/\s+/).filter(Boolean).length;

export default detector({
  id: "negated-echo",
  label: "negated echo",
  level: REVIEW,
  note: "a negation carrying its own half is not this",
  find: (units, cfg) => {
    const c = cfg["negated-echo"];
    return sentenceHits(units, (s) => {
      const m = TAIL.exec(s);
      if (!m || count(s) < c.landed) return false;
      if (count(m[0].replace(/^[\s,]+|[\s,.]+$/g, "")) > c.max_tail_words) return false;
      const negated = (m[1] ?? "").replace(/^[\s,.]+|[\s,.]+$/g, "");
      if (!negated) return true;      // the English shape: the tail ends on the negation
      return !(NOT_A_VERB.test(negated) || INFINITIVE.test(negated));
    });
  },
});
