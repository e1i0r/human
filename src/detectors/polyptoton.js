/**
 * polyptoton · REVIEW · es/en
 *
 * Detects
 *   One root repeating three or more times close together: within about forty
 *   words of running text.
 *
 * Fix
 *   Name the two things separately, in plain words.
 *
 * Before   Un número que se imprime y se ignora es un número que se va.
 * After    Un número que se imprime y nadie mira se va cayendo de a poco.
 *
 * Not this
 *   The canonical noun repeating on purpose. A paragraph about rules says
 *   "regla" many times, and cycling synonyms for it is the worse tell. Nor a
 *   word coming back three sentences later: a subject stays the subject.
 *
 * Why
 *   Circularity reads as insight and says nothing. Density is what separates it
 *   from ordinary repetition, which is why the window exists: counting across a
 *   whole paragraph flagged "cambias ... cambia el motor ... cambias", a
 *   sentence each apart in a paragraph about changing engines, and the rewrite
 *   that followed was worse than what it replaced.
 */
import { REVIEW, detector } from "./base.js";

const STOP = new Set((
  "para pero como este esta estos estas cada todo toda todos todas donde cuando " +
  "porque desde entre sobre hasta mientras aunque which their there where when " +
  "that this these those"
).split(" "));

const LETTERS = /[^a-záéíóúñü]/g;

/**
 * The first root appearing enough times inside any window of words as written.
 *
 * The window counts words as written, not words left after filtering: over a
 * filtered list forty entries reach across three or four sentences, which is
 * the span this was tightened to stop looking at.
 */
function dense(text, { window, enough, min_len: minLen }) {
  const all = text.toLowerCase().split(/\s+/);
  for (let i = 0; i < all.length; i++) {
    const seen = new Map();
    for (const raw of all.slice(i, i + window)) {
      const token = raw.replace(LETTERS, "");
      if (token.length < minLen || STOP.has(token)) continue;
      const stem = token.slice(0, 5);
      seen.set(stem, (seen.get(stem) ?? 0) + 1);
    }
    // The whole window is counted before anything is reported: stopping at the
    // threshold gives back the threshold instead of how often the root is
    // actually there, which is the number a reader needs to judge it.
    for (const [stem, n] of seen) {
      if (n >= enough) return [stem, n];
    }
  }
  return null;
}

export default detector({
  id: "polyptoton",
  label: "polyptoton",
  level: REVIEW,
  note: "the canonical noun repeats on purpose",
  find: (units, cfg) => {
    const out = [];
    for (const unit of units) {
      const found = dense(unit.text, cfg.polyptoton);
      if (found) {
        const [stem, n] = found;
        out.push({ unit, quote: `raiz '${stem}' x${n}: ${unit.text.slice(0, 70)}` });
      }
    }
    return out;
  },
});
