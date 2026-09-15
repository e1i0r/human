/**
 * heading-no-subject · REVIEW · es/en
 *
 * Detects
 *   A heading opening on an interrogative or a subordinator, carrying no
 *   determiner and no proper noun. Vive qué. Va qué. Atraviesa qué.
 *
 * Fix
 *   Put the noun in.
 *
 * Before   Dónde vive · Cuando se te atraviesa
 * After    Dónde vive cada regla · Cuando una regla te frena
 *
 * Not this
 *   A heading that already names the thing: "En qué va Orbit", "Qué es una
 *   regla".
 *
 * Why
 *   A reader skimming headings should not have to reconstruct the noun from
 *   the section body. It is the dangling-antecedent bug in a bigger font, and
 *   headings get skipped in review more than any other unit.
 */
import { REVIEW, detector } from "./base.js";

const INTERROG = /^(?:Cu[aá]ndo|Cuando|D[oó]nde|Donde|C[oó]mo|Como|Qu[eé]|Por\s+qu[eé]|En\s+qu[eé]|Si(?![\p{L}])|When|Where|How|What|Why|If)(?![\p{L}])/iu;
const DET = /(?<![\p{L}])(?:el|la|los|las|un|una|unos|unas|tu|su|sus|cada|este|esta|estos|estas|mi|nuestro|the|a|an|your|his|her|its|each|this|these)(?![\p{L}])/iu;

export default detector({
  id: "heading-no-subject",
  label: "heading with no subject",
  level: REVIEW,
  note: "lives where? goes where? crosses what?",
  find: (units, cfg) => {
    const limit = cfg["heading-no-subject"].max_words;
    const out = [];
    for (const unit of units) {
      if (unit.kind !== "heading") continue;
      const t = unit.text.trim();
      const parts = t.split(/\s+/).filter(Boolean);
      if (!INTERROG.test(t) || parts.length > limit) continue;
      if (DET.test(t) || parts.slice(1).some((w) => /^\p{Lu}/u.test(w))) continue;
      out.push({ unit, quote: t });
    }
    return out;
  },
});
