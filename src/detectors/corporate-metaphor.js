/**
 * corporate-metaphor · REVIEW · es/en
 *
 * Detects
 *     A consulting-deck word standing where a mechanism belongs.
 *     es: silo · ecosistema · sinergia · palanca · hoja de ruta · bala de plata ·
 *         estado del arte · disruptivo · empoderar · holístico · salsa secreta
 *     en: silo · ecosystem · synergy · low-hanging fruit · move the needle ·
 *         silver bullet · game-changer · state of the art · holistic · empower ·
 *         north star · secret sauce
 *
 * Fix
 *     Say the mechanism. The metaphor is usually covering for a fact the writer
 *     had and did not reach for.
 *
 * Before
 *     CLAUDE.md y AGENTS.md son silos que se vacían el día que cambia el motor.
 * After
 *     CLAUDE.md lo lee Claude y AGENTS.md lo lee Codex. Cambias de motor y el
 *     nuevo no sabe nada de lo que decía el otro.
 *
 * Not this
 *     The word used on purpose, about the thing it names: "cada área en su silo"
 *     is a sentence about organisations, not a metaphor hiding a mechanism.
 *
 * Why
 *     REVIEW and never HARD, because a regex finds the word and the word is not
 *     the tell. What makes it one is standing in for a mechanism the writer could
 *     have described, and only a reader can see that. "roadmap" is not on the
 *     list: in a corpus of 58 pieces it appeared six times, always as the plain
 *     name of a plan, which is what a word earns its place back by doing.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:silos?|ecosistemas?|sinergias?|palancas?|apalanca(?:r|mos|n)|hojas?\s+de\s+ruta|salsa\s+secreta|balas?\s+de\s+plata|estado\s+del\s+arte|disruptiv[oa]s?|empodera(?:r|miento)|hol[ií]stic[oa]s?|norte\s+estrat[eé]gico|piedra\s+de\s+toque|silos?|ecosystems?|synerg(?:y|ies)|low-hanging\s+fruit|move\s+the\s+needle|silver\s+bullets?|game.?changers?|state\s+of\s+the\s+art|holistic|empower(?:s|ing|ment)?|north\s+star|secret\s+sauce)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "corporate-metaphor",
  label: "corporate metaphor",
  level: REVIEW,
  langs: "es/en",
  note: "the word used about the thing it names is not this",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
