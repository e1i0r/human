/**
 * banned-vocabulary · HARD · es/en
 *
 * Detects
 *   143 terms, both languages, grouped in the source below by what they are
 *   doing: core vocabulary, hedges and filler, formula openers and closers,
 *   significance inflation, promotional register. Spanish carries its gender
 *   and number endings, because robusto did not match robusta for an afternoon.
 *
 *   en: delve · comprehensive · foster · pivotal · showcase · a myriad of ·
 *       in conclusion · at the end of the day · breathtaking
 *   es: profundizar · exhaustivo · fomentar · piedra angular · cabe señalar ·
 *       en síntesis · a día de hoy · juega un papel clave
 *
 * Fix
 *   The concrete word the domain would use. utilizar becomes usar. robusto
 *   becomes whatever it actually does: "aguanta 4.000 corridas al día".
 *
 * Before   Una plataforma robusta y comprehensiva.
 * After    Aguanta 4.000 corridas al día.
 *
 * Not this
 *   "Integral" in its mathematical sense. "Crucial" inside a quotation. And
 *   "leverage", which is out on the evidence: every occurrence across 34,000
 *   words was the noun, most with a number beside it. The verb still counts
 *   when it takes an object.
 *
 * Why
 *   These sit at the top of the model's distribution and nowhere near the top
 *   of a person's. Across 58 pieces by one author the whole list fired sixteen
 *   times and every hit was real, which is the density a closed list has to
 *   keep: one that fires on every page gets turned off.
 */
import { HARD, detector, sentenceHits } from "./base.js";

const BANNED = /\b(?:delve|utiliz(?:e|es|ing|ed)|robust|comprehensive|streamline[ds]?|streamlining|foster(?:s|ing)?|facilitate[sd]?|pivotal|nuanced|multifaceted|myriad|plethora|garner(?:s|ed|ing)?|vibrant|tapestry|interplay|intricacies|intricate|showcas(?:e|es|ing|ed)|underscor(?:e|es|ing|ed)|align\s+with|enduring|it\s+is\s+important\s+to\s+note|it'?s\s+worth\s+noting|it\s+is\s+worth\s+mentioning|generally\s+speaking|in\s+many\s+cases|it\s+can\s+be\s+argued|needless\s+to\s+say|it\s+goes\s+without\s+saying|in\s+today'?s\s+fast-paced\s+world|in\s+conclusion|in\s+summary|to\s+summari[sz]e|at\s+the\s+end\s+of\s+the\s+day|at\s+its\s+core|under\s+the\s+hood|furthermore|moreover|it\s+is\s+clear\s+that|this\s+highlights|this\s+underscores|as\s+previously\s+mentioned|stands\s+as\s+a\s+testament|testament\s+to|marks\s+a\s+pivotal\s+moment|indelible\s+mark|evolving\s+landscape|setting\s+the\s+stage\s+for|deeply\s+rooted\s+in|plays\s+a\s+vital\s+role|a\s+key\s+turning\s+point|nestled|in\s+the\s+heart\s+of|breathtaking|must-visit|stunning|renowned\s+for|boasts\s+a\s+rich|groundbreaking|a\s+myriad\s+of|a\s+plethora\s+of|in\s+the\s+realm\s+of|profundiza(?:r|ndo|mos|n)|utiliza(?:r|ndo|mos|n)|robust[oa]s?|integral(?:es)?|optimiza(?:r|ndo|mos|n)|exhaustiv[oa]s?|multifac[eé]tic[oa]s?|crucial(?:es)?|primordial(?:es)?|fomenta(?:r|ndo|mos|n)|facilita(?:r|ndo|mos|n)|abanico\s+de|sinfin\s+de|sinn[uú]mero\s+de|entramado|panorama\s+actual|paisaje\s+(?:digital|actual)|piedra\s+angular|pilar\s+fundamental|cabe\s+(?:destacar|se[nñ]alar|mencionar)|es\s+importante\s+(?:notar|destacar|mencionar|se[nñ]alar)|vale\s+la\s+pena\s+(?:notar|mencionar|destacar)|por\s+lo\s+tanto,|dicho\s+esto|no\s+est[aá]\s+de\s+m[aá]s|en\s+conclusi[oó]n|en\s+resumen|en\s+s[ií]ntesis|para\s+concluir|en\s+el\s+mundo\s+actual|hoy\s+en\s+d[ií]a|a\s+fin\s+de\s+cuentas|en\s+esencia|fundamentalmente|en\s+definitiva|a\s+d[ií]a\s+de\s+hoy|juega\s+un\s+papel\s+(?:clave|fundamental|crucial)|marca\s+un\s+antes\s+y\s+un\s+despu[eé]s|deja\s+una\s+huella|sienta\s+las\s+bases|un\s+punto\s+de\s+inflexi[oó]n|profundamente\s+arraigad[oa])\b/i;

// "leverage" is a verb here only when it takes an object.
const LEVERAGE = /\blevera(?:ge|ging|ged)\s+(?:our|your|their|the|its)\b/i;

export default detector({
  id: "banned-vocabulary",
  label: "banned vocabulary",
  level: HARD,
  find: (units) => sentenceHits(units, (s) => BANNED.test(s) || LEVERAGE.test(s)),
});
