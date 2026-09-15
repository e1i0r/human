/**
 * stacked-superlative · REVIEW · es/en
 *
 * Detects
 *     todavía más · aún más · muchísimo más · absolutamente esencial, attached to
 *     a claim already at the top of its scale.
 *
 * Fix
 *     Keep the first claim and replace the escalation with the concrete mechanism.
 *
 * Before
 *     La decisión más difícil, y eso la hace todavía más dura.
 * After
 *     La decisión más difícil, porque hay más cosas que podrían encajar.
 *
 * Not this
 *     A comparison with numbers behind it.
 *
 * Why
 *     The second escalation is unearned and costs the first claim its credibility.
 */
import { REVIEW, detector, sentenceHits } from "./base.js";

const PATTERN = /(?<![\p{L}\p{M}\p{N}_])(?:todav[ií]a\s+m[aá]s|a[uú]n\s+m[aá]s|much[ií]simo\s+m[aá]s|por\s+mucho\s+el\s+m[aá]s|even\s+more\s+so|harder\s+still|absolutamente\s+(?:esencial|cr[ií]tico)|absolutely\s+essential)(?![\p{L}\p{M}\p{N}_])/iu;

export default detector({
  id: "stacked-superlative",
  label: "stacked superlative",
  level: REVIEW,
  langs: "es/en",
  find: (units) => sentenceHits(units, (s) => PATTERN.test(s)),
});
