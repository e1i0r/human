/**
 * parallel-subject-mirror · REVIEW · es/en
 *
 * Detects
 *   Two consecutive sentences opening on the same determiner with a different
 *   noun.
 *
 * Fix
 *   Vary one of the two subjects, or join them.
 *
 * Before   El código es una cosa. El mantenimiento es otra.
 * After    Escribir el código cuesta una semana, y mantenerlo cuesta los tres
 *          años siguientes.
 *
 * Not this
 *   A table, or an enumeration where the mirror is the structure.
 *
 * Why
 *   Mirrored openers read as a rhetorical figure rather than two facts, and the
 *   symmetry usually hides that the second half adds nothing.
 */
import { REVIEW, detector } from "./base.js";

// The second group is whatever Python's \w matches, digits included: "El 75%
// del día" mirrors "El producto que", and a letters-only class misses it.
const DET = /^(El|La|Los|Las|Un|Una|The|A)\s+([\p{L}\p{N}_]+)/iu;

export default detector({
  id: "parallel-subject-mirror",
  label: "parallel-subject mirror",
  level: REVIEW,
  find: (units) => {
    const out = [];
    for (const unit of units) {
      const ss = unit.sentences();
      for (let i = 0; i + 1 < ss.length; i++) {
        const a = DET.exec(ss[i]);
        const b = DET.exec(ss[i + 1]);
        if (!a || !b) continue;
        if (a[1].toLowerCase() === b[1].toLowerCase()
            && a[2].toLowerCase() !== b[2].toLowerCase()) {
          out.push({ unit, quote: `${ss[i].slice(0, 48)}  ||  ${ss[i + 1].slice(0, 48)}` });
        }
      }
    }
    return out;
  },
});
