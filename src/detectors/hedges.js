/**
 * hedges · REVIEW · es/en
 *
 * Detects
 *     generalmente · por lo general · suele + verbo · en muchos casos · quizás ·
 *     generally · typically · often.
 *
 * Fix
 *     Assert directly. If a real exception exists, name it: "esto se rompe cuando X".
 *
 * Before
 *     Generalmente los equipos suelen ignorar esto.
 * After
 *     De los seis equipos con los que he trabajado, cinco no lo miraban.
 *
 * Not this
 *     Real uncertainty stated with its conditions, which is honesty rather than a
 *     softener.
 *
 * Why
 *     Hedge density is one of the measured signals, and a softener is what goes in
 *     when the writer has no number to put there. "suele" took any verb after the
 *     list only caught "suele ser", and "suele venir" walked past it.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:generalmente|por\s+lo\s+general|en\s+muchos\s+casos|suele[ns]?\s+[\p{L}\p{M}\p{N}_]+(?:ar|er|ir)(?![\p{L}\p{M}\p{N}_])|sol[ií]a[ns]?\s+[\p{L}\p{M}\p{N}_]+(?:ar|er|ir)(?![\p{L}\p{M}\p{N}_])|podr[ií]a\s+decirse|quiz[aá]s?|tal\s+vez|en\s+cierto\s+modo|generally|typically|often|in\s+many\s+cases|arguably|somewhat)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "hedges",
  label: "hedges",
  level: REVIEW,
  langs: "es/en",
  note: "real uncertainty is stated with its conditions, not with a softener",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
