/**
 * Cut a string into sentences.
 *
 * Its own file because it is a different problem from finding units in a
 * document, and it is the part that grows: every abbreviation, every language,
 * every way a number can carry a period lands here.
 */

// A sentence ends at . ! ? followed by whitespace and an opener. Spanish starts
// a question or an exclamation with ¿ and ¡, which must count as openers.
const END = /(?<=[.!?])\s+(?=[¿¡A-ZÁÉÍÓÚÑ0-9«"'])/u;

const ABBR = /\b(?:Sr|Sra|Dr|Dra|etc|vs|p\.ej|i\.e|e\.g|Mr|Mrs|Ms|Inc|No)\.$/i;
const DECIMAL = /\d\.$/;

/**
 * @param {string} text
 * @returns {string[]} sentences, with abbreviations and decimals kept whole
 */
export function split(text) {
  const out = [];
  let buf = "";
  for (const piece of text.split(END)) {
    buf = buf ? `${buf} ${piece}`.trim() : piece;
    if (ABBR.test(buf) || DECIMAL.test(buf)) continue; // the period belonged to the word
    out.push(buf);
    buf = "";
  }
  if (buf) out.push(buf);
  return out.map((s) => s.trim()).filter(Boolean);
}
