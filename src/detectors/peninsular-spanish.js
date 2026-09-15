/**
 * peninsular-spanish · REVIEW · es
 *
 * Detects
 *     Peninsular vocabulary in text written for Latin America. The usual way it
 *     arrives is translation: an English word has one obvious Spanish equivalent
 *     and it is the Madrid one.
 *
 *     tirar (botar) · coger (agarrar) · ordenador (computadora) · móvil (celular)
 *     vale (dale) · zumo (jugo) · piso (apartamento) · conducir (manejar)
 *     aparcar (estacionar) · fichero (archivo) · ratón (mouse) · gafas (lentes)
 *     billete (boleto) · patata (papa) · nevera (refrigerador) · grifo (llave)
 *
 * Fix
 *     The word the reader would use. It is one substitution and it costs nothing.
 *
 * Before
 *     y nada se tira porque te molestó una vez
 * After
 *     y no pierdes una regla porque te molestó una vez
 *
 * Not this
 *     The word in a sense both regions share: "tirar de la cuerda", "coger el
 *     ritmo", "un piso de la torre", "cuánto vale" from the verb valer. Nor a
 *     quotation of somebody who talks that way.
 *
 * Why
 *     It does not read as a mistake. It reads as somebody who is not from here,
 *     which is a worse thing for a page whose whole argument is that a person
 *     wrote it. And it is the cheapest tell to fix and the hardest to notice,
 *     because the sentence is grammatical and the meaning arrives.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?:(?<![\p{L}\p{M}\p{N}_])se\s+tiran?(?![\p{L}\p{M}\p{N}_])(?!\s+de(?![\p{L}\p{M}\p{N}_]))|(?<![\p{L}\p{M}\p{N}_])tira(?:r|n|mos)\s+(?:a\s+la\s+basura|el|la|los|las)(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])cog(?:er|es|e|emos|en|í|ió)(?![\p{L}\p{M}\p{N}_])(?!\s+(?:el\s+ritmo|confianza|fuerza|carrerilla))|(?<![\p{L}\p{M}\p{N}_])ordenador(?:es)?(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])m[oó]vil(?:es)?(?![\p{L}\p{M}\p{N}_])(?!\s+(?:de|en))|(?<![a-záéíóúñ]\s)(?![\p{L}\p{M}\p{N}_])vale(?![\p{L}\p{M}\p{N}_])(?=[,.]\s|\s*$)(?<!cu[aá]nto vale)|(?<![\p{L}\p{M}\p{N}_])zumos?(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])aparca(?:r|n|do|miento)(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])fichero(?:s)?(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])rat[oó]n(?:es)?(?![\p{L}\p{M}\p{N}_])(?=\s*(?:y|,|\.|\s+del?\s+(?:la\s+)?(?:computador|pc|ordenador)))|(?<![\p{L}\p{M}\p{N}_])gafas(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])billete(?:s)?(?![\p{L}\p{M}\p{N}_])(?!\s+de\s+(?:banco|d[oó]lar))|(?<![\p{L}\p{M}\p{N}_])patatas?(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])nevera(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])grifo(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])acera(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])coche(?:s)?(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])curr(?:o|ar|ando)(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])vosotros(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])hab[eé]is(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])ten[eé]is(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])sois(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])vuestr[oa]s?(?![\p{L}\p{M}\p{N}_]))/iu;

export default detector({
  id: "peninsular-spanish",
  label: "peninsular spanish",
  level: REVIEW,
  langs: "es",
  note: "the sense both regions share is not this",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
