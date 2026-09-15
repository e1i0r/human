/**
 * english-calque · REVIEW · es
 *
 * Detects
 *     An English idiom translated word for word. It parses, it means something,
 *     and nobody says it.
 *
 *     dar contra una pared (trabarse) · aplicar para (postularse a)
 *     en la misma página (de acuerdo)
 *     tomar un paso atrás (dar un paso atrás) · al final del día (a fin de cuentas)
 *     correr un test (pasar un test) · manejar un error (gestionar un error)
 *     remover (quitar) · asumir que (suponer que) · realizar que (darse cuenta)
 *     soportar (mantener, en el sentido de support) · consistente con (acorde a)
 *     regla ancha / estrecha (amplia, general / acotada), de wide y narrow
 *
 * Fix
 *     The phrase somebody here would say. If none exists, the idea was borrowed
 *     along with the words and is worth restating.
 *
 * Before
 *     Un agente que se da contra una pared a mitad de tarea
 * After
 *     Un agente que se traba a mitad de tarea
 *
 * Not this
 *     A term the industry uses in English on purpose: commit, deploy, pull
 *     request, chargeback. Nor a calque that won: "hacer sentido" and "librería"
 *     are what Spanish-speaking programmers say, and a detector that argues with
 *     an entire profession is one that gets turned off. A corpus check settles
 *     which is which: four uses across 29 pieces by one careful writer means the
 *     word is theirs, not a slip.
 *
 * Why
 *     This is what translation leaves behind, and it is the tell a reader feels
 *     without naming: the grammar is Spanish and the thinking is not. It is
 *     worse than a wrong word because nothing is technically wrong.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?:(?<![\p{L}\p{M}\p{N}_])(?:dar|da|dan|darse|se\s+da|se\s+dan|dio|dando)\s+contra\s+(?:una?\s+)?pared|(?<![\p{L}\p{M}\p{N}_])aplica(?:r|n|ndo)\s+para(?![\p{L}\p{M}\p{N}_])(?!\s+(?:el|la|los|las)\s+(?:caso|regla|norma))|(?<![\p{L}\p{M}\p{N}_])en\s+la\s+misma\s+p[aá]gina(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])tom(?:ar|a|amos|an)\s+un\s+paso\s+atr[aá]s(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])al\s+final\s+del\s+d[ií]a(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])realiz(?:ar|o|[oó]|amos|an)\s+que(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])asumi(?:r|mos|endo)\s+que(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])es\s+consistente\s+con(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])soporta(?:r|n|mos)\s+(?:el|la|los|las|un|una)(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])remov(?:er|i[oó]|imos|iendo)(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])implementa(?:r|ndo)\s+una\s+decisi[oó]n(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])hacer\s+un\s+punto(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])de\s+acuerdo\s+a(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])(?:regla|alcance|definici[oó]n|criterio|norma|b[uú]squeda|consulta)s?(?![\p{L}\p{M}\p{N}_])[^.]{0,30}(?<![\p{L}\p{M}\p{N}_])(?:muy\s+)?(?:anch[oa]s?|estrech[oa]s?)(?![\p{L}\p{M}\p{N}_])|(?<![\p{L}\p{M}\p{N}_])(?:muy\s+)?(?:anch[oa]|estrech[oa])s?(?![\p{L}\p{M}\p{N}_])[^.]{0,20}(?<![\p{L}\p{M}\p{N}_])(?:regla|alcance|definici[oó]n|criterio)s?(?![\p{L}\p{M}\p{N}_]))/iu;

export default detector({
  id: "english-calque",
  label: "english calque",
  level: REVIEW,
  langs: "es",
  note: "an English term the industry keeps on purpose is not this",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
