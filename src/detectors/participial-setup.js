/**
 * participial-setup · REVIEW · es/en
 *
 * Detects
 *     A sentence opening Con X hecho y Y puesto, · Una vez definido X, · Having
 *     done X,.
 *
 * Fix
 *     Lead with the subject and the action. If the clause restates the heading in
 *     fancier words, cut the sentence.
 *
 * Before
 *     Con la definición hecha y los límites puestos, el modelo produce.
 * After
 *     El modelo produce más rápido de lo que alcanzas a leer.
 *
 * Not this
 *     A real temporal condition the reader needs.
 *
 * Why
 *     The symmetry is the tell: two balanced participles stacking conditions and
 *     holding the reader off before the subject arrives.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /^(?:Con\s+[^,]{5,60}\s+(?:hecho|hecha|puesto|puesta|escrito|escrita|definido|definida|listo|lista),|Una\s+vez\s+[^,]{5,50},|(?:Having|With)\s+[^,]{5,60},)\s/iu;

export default detector({
  id: "participial-setup",
  label: "participial setup",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
