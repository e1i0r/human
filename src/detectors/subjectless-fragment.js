/**
 * subjectless-fragment · REVIEW · es/en
 *
 * Detects
 *     A sentence of six words or fewer opening on a preposition or a negation,
 *     with nobody in it doing anything.
 *
 * Fix
 *     Give it back its subject, or fold it into the sentence beside it. Do not
 *     delete it: the rhythm rules want short sentences. What is wrong is the
 *     missing actor, never the length.
 *
 * Before
 *     Nunca de un modelo. Corre en cada fase futura.
 * After
 *     Lo escribes tú, nunca un modelo. Corre en cada fase futura.
 *
 * Not this
 *     A short sentence with a subject: "Me pasa seguido."
 *     A list of names: "Claude Code, Codex."
 *     An answer to a when: "Siempre." · "Antes del pull request."
 *
 * Why
 *     The thing a humanizing pass most often introduces while fixing something
 *     else, because compressing and landing feels like good editing. With a
 *     subject it is a sentence; without one it is a slogan.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /^(?:Sin|Con|Para|Por|Ante|Bajo|Contra|Desde|Durante|Entre|Hacia|Hasta|Seg[uú]n|Sobre|Tras|Nunca|Jam[aá]s|Tampoco|Ni(?![\p{L}\p{M}\p{N}_])|Nada\s+de|Solo\s+(?:de|en|con)|S[oó]lo\s+(?:de|en|con)|Without|With|For|By|Never|Neither|Nor|Not(?![\p{L}\p{M}\p{N}_])|Only\s+(?:from|with|in))(?![\p{L}\p{M}\p{N}_])/u;

export default detector({
  id: "subjectless-fragment",
  label: "subjectless fragment",
  level: REVIEW,
  langs: "es/en",
  note: "an answer to a when (Antes del pull request.) is legitimate",
  find: (units, cfg) => sentenceHits(units, (s) => s.split(/\s+/).filter(Boolean).length <= cfg["subjectless-fragment"].max_words
    && PATTERN.test(s)),
});
