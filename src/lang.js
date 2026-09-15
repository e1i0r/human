/**
 * Which language a piece of prose is in, so a detector can sit one out.
 *
 * Every detector already declared the languages it means anything in, and until
 * now that was decoration: `negated-echo` ran on Spanish and cost nine false
 * positives across twenty-nine pieces, because "y no está en ningún tablero" is
 * an ordinary way to end a Spanish sentence and an echo in English is not.
 *
 * Function words settle it. They are the most common words in any text, they are
 * untranslatable one to one, and a page of Spanish and a page of English do not
 * share them. No model, no dependency, no network.
 */

// The commonest words in each, and none that the other borrows. "no" is out:
// it is Spanish and English at once, and so is "a" and "de".
export const MARKERS = {
  es: new Set(["como", "con", "cuando", "de", "donde", "el", "es", "eso", "esto", "est\u00e1", "est\u00e1n", "hay", "la", "las", "lo", "los", "m\u00e1s", "para", "pero", "por", "porque", "que", "se", "son", "su", "sus", "una", "ya"]),
  en: new Set(["and", "are", "as", "at", "be", "but", "for", "from", "has", "have", "is", "it", "not", "of", "on", "or", "that", "the", "they", "this", "to", "was", "what", "when", "which", "with", "you"]),
};

// Below this the sample is too short to tell, and a wrong guess turns off a
// detector nobody asked to turn off.
const ENOUGH = 20;

const WORDS = /[a-záéíóúñü']+/g;

/**
 * @param {string} text
 * @returns {"es"|"en"|null} null when the sample cannot say
 */
export function of(text) {
  const seen = new Map();
  for (const w of text.toLowerCase().match(WORDS) ?? []) {
    seen.set(w, (seen.get(w) ?? 0) + 1);
  }
  const score = {};
  for (const [code, marks] of Object.entries(MARKERS)) {
    score[code] = [...marks].reduce((n, w) => n + (seen.get(w) ?? 0), 0);
  }
  const [top, other] = Object.keys(score).sort((a, b) => score[b] - score[a]);
  if (score[top] < ENOUGH) return null;
  // A clear win, not a coin flip: a page quoting the other language still
  // belongs to the one it is written in.
  return score[top] >= 1.5 * Math.max(score[other], 1) ? top : null;
}

/**
 * Whether a detector means anything in the language of this text.
 *
 * @param {string} detectorLangs "es", "en", or "es/en"
 * @param {"es"|"en"|null} language
 */
export function applies(detectorLangs, language) {
  if (language === null || detectorLangs.includes("/")) return true;
  return detectorLangs === language;
}
