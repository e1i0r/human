/**
 * ai-transition · HARD · es/en
 *
 * Detects
 *   A sentence opening on Además, · Asimismo, · Por otro lado, · Es evidente
 *   que · Como se mencionó · Furthermore, · Moreover, · Additionally,.
 *
 * Fix
 *   Delete it. The next sentence stands on its own, and if a bridge is needed,
 *   "Y" is the bridge.
 *
 * Before   Además, el equipo trabaja.
 * After    El equipo trabaja.
 *
 * Not this
 *   "además" mid-sentence, which is ordinary speech.
 *
 * Why
 *   Connective scaffolding a person does not need and a model reaches for by
 *   default. The pattern must not end in a word boundary: after a comma one
 *   never holds, and this matched nothing at all until that was found.
 */
import { HARD, detector, sentenceHits } from "./base.js";

const TRANS = /^(?:Adem[aá]s,|Asimismo,|Por\s+otro\s+lado,|Cabe\s+se[nñ]alar"r"|Es\s+evidente\s+que|Como\s+se\s+mencion[oó]"r"|Furthermore,|Moreover,|Additionally,|In\s+addition,|As\s+mentioned)/i;

export default detector({
  id: "ai-transition",
  label: "AI transition",
  level: HARD,
  find: (units) => sentenceHits(units, (s) => TRANS.test(s)),
});
