/**
 * agentless-passive · REVIEW · es
 *
 * Detects
 *     se paga · se decide · se toma · se guarda · se mide and company.
 *
 * Fix
 *     Name who. Especially when the paragraph is about there being somebody who
 *     does it.
 *
 * Before
 *     ese precio se paga a sabiendas
 * After
 *     ese precio lo pagas sabiendo
 *
 * Not this
 *     A real impersonal where the actor does not matter: "se parte por la costura".
 *
 * Why
 *     It removes the actor from a sentence whose point is that there is one, and
 *     it usually hides that no concrete method was ever named.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])se\s+(?:paga|decide|deciden|hace|hacen|toma|toman|guarda|guardan|escribe|escriben|mide|miden|respeta|respetan|considera|logra|busca)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "agentless-passive",
  label: "agentless passive",
  level: REVIEW,
  langs: "es",
  note: "only counts where the sentence is about what somebody does",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
