/**
 * tricolon · REVIEW · es/en
 *
 * Detects
 *   Exactly three comma-separated members, each six words or fewer, sharing
 *   their grammar.
 *
 * Fix
 *   Break the third into its own sentence, join two with "y", or reduce to two.
 *
 * Before   Rápido, barato, confiable.
 * After    Rápido y barato. Confiable es otra conversación.
 *
 * Not this
 *   A real inventory of six things, which is content: "todo, un lenguaje, un
 *   repositorio, un directorio, un archivo, un símbolo".
 *
 * Why
 *   Three parallel beats escalating in weight is cadence. Counting every comma
 *   series instead finds the inventories and buries the two real hits.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const LEAD_IN = /^[^:]{0,40}:\s*/;
const SPLIT = /,\s*|\s+(?:y|e|and)\s+/;

const count = (s) => s.split(/\s+/).filter(Boolean).length;

export default detector({
  id: "tricolon",
  label: "tricolon",
  level: REVIEW,
  note: "a real inventory of three things is not one",
  find: (units, cfg) => {
    const c = cfg.tricolon;
    return sentenceHits(units, (s) => {
      const body = s.replace(/\.$/, "").replace(LEAD_IN, "");
      const parts = body.split(SPLIT).map((p) => p.trim()).filter(Boolean);
      if (parts.length !== c.members) return false;
      if (parts.some((p) => count(p) > c.max_member_words)) return false;
      const heads = parts.map((p) => p.split(/\s+/)[0].toLowerCase());
      const lengths = new Set(parts.map(count));
      return new Set(heads).size < 3 || lengths.size === 1;
    });
  },
});
