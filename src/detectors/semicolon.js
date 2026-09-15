/**
 * semicolon · HARD · es/en
 *
 * Detects
 *   A semicolon after a letter. Budget: none.
 *
 * Fix
 *   A period, almost always. "y" / "pero" / "así que" when the relation matters.
 *
 * Before   Nadie mide; nadie lo nota.
 * After    Nadie mide, así que nadie lo nota.
 *
 * Not this
 *   A list whose items already carry commas: "Caracas, Venezuela; Bogotá, Colombia".
 *
 * Why
 *   Prose outside academic or legal writing almost never uses one, so every
 *   appearance is worth treating as a bug until proven otherwise.
 */
import { HARD, detector, sentenceHits } from "./base.js";

const SEMI = /[a-záéíóúñü];/;

export default detector({
  id: "semicolon",
  label: "semicolon",
  level: HARD,
  find: (units) => sentenceHits(units, (s) => SEMI.test(s)),
});
