/**
 * elevated-register · REVIEW · es
 *
 * Detects
 *     A thesis word where the plain one fits: enunciar · dilucidar · esgrimir ·
 *     plasmar · ostentar · propiciar · aunar · vislumbrar · coadyuvar ·
 *     subyacer · devenir · acaecer · conllevar · ergo · empero · asimismo ·
 *     en aras de · a la sazón · por ende · no obstante · habida cuenta.
 *
 * Fix
 *     The word somebody would say out loud. enunciar becomes decir or escribir,
 *     conllevar becomes traer, en aras de becomes para.
 *
 * Before
 *     es una regla que nadie enunció
 * After
 *     es una regla que nunca escribiste
 *
 * Not this
 *     The word in a register that asks for it: a legal clause, a quotation, an
 *     academic paper. Nor a term with no plain equivalent in its field.
 *
 * Why
 *     A model reaches for the formal synonym because it is the safer token, and
 *     the sentence lands a register above the rest of the page. One of these in
 *     a casual paragraph is heard the way a tie is seen at a barbecue.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:enuncia(?:r|do|da|ron|mos|n)|enunci[oó]|dilucida(?:r|ndo)|esgrim(?:ir|e|en|i[oó])|plasma(?:r|ndo|do|da)|ostenta(?:r|ndo|n)|propicia(?:r|ndo|n)|aunar|aunando|vislumbra(?:r|ndo|n)|coadyuva(?:r|ndo|n)|subyac(?:e|en|ente)|deven(?:ir|dr[aá])|acaec(?:er|i[oó])|conlleva(?:r|n|ndo)|dirim(?:ir|e|en)|soslaya(?:r|ndo)|ergo|empero|asimismo|en\s+aras\s+de|a\s+la\s+saz[oó]n|por\s+ende|habida\s+cuenta|amerita(?:r|n)|menester|otrora|amen\s+de)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "elevated-register",
  label: "elevated register",
  level: REVIEW,
  langs: "es",
  note: "a register that asks for it is not this",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
