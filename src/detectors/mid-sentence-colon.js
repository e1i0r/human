/**
 * mid-sentence-colon · REVIEW · es/en
 *
 * Detects
 *     A colon followed by a lowercase letter.
 *
 * Fix
 *     Split in two, or rewrite. At most one per paragraph outside lists.
 *
 * Before
 *     La respuesta es: empezar antes.
 * After
 *     Empieza antes.
 *
 * Not this
 *     A colon after a complete clause, which is correct and common: "Cuatro
 *     comandos, y el único que tienes que pensar es el tercero: apuntar la sala
 *     de control."
 *
 * Why
 *     Mid-thought it is a reveal device. At the end of a clause it is punctuation.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /[a-záéíóúñü]:\s+[a-záéíóúñü]/u;

export default detector({
  id: "mid-sentence-colon",
  label: "mid-sentence colon",
  level: REVIEW,
  langs: "es/en",
  note: "fine when a complete clause comes before it",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
